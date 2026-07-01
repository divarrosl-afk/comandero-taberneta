/**
 * Polling de print_jobs en Supabase (modo Vercel / nube).
 * El Lenovo solo necesita salida a Internet hacia Supabase.
 */
import { createClient } from "@supabase/supabase-js";
import { buildEscPosBuffer, printTcp } from "./escpos.js";

const POLL_MS = Number(process.env.CLOUD_POLL_MS ?? 3000);
const RESTAURANTE_ID = process.env.SUPABASE_RESTAURANTE_ID?.trim();
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

let supabase = null;
let polling = false;

const stats = {
  startedAt: null,
  lastPollAt: null,
  lastJobsFound: 0,
  lastPrintedJobId: null,
  lastError: null,
  totalPrinted: 0,
  totalErrors: 0,
};

function getClient() {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabase;
}

function missingConfigReason() {
  const missing = [];
  if (!SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!SERVICE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!RESTAURANTE_ID) missing.push("SUPABASE_RESTAURANTE_ID");
  return missing;
}

/** Estado público para /health (sin secretos). */
export function getCloudPollerStatus() {
  const missing = missingConfigReason();
  const active = missing.length === 0;
  return {
    cloudPolling: active,
    pollIntervalMs: POLL_MS,
    restauranteIdConfigured: Boolean(RESTAURANTE_ID),
    supabaseUrlConfigured: Boolean(SUPABASE_URL),
    serviceRoleConfigured: Boolean(SERVICE_KEY),
    missingEnv: missing,
    stats: {
      startedAt: stats.startedAt,
      lastPollAt: stats.lastPollAt,
      lastJobsFound: stats.lastJobsFound,
      lastPrintedJobId: stats.lastPrintedJobId,
      lastError: stats.lastError,
      totalPrinted: stats.totalPrinted,
      totalErrors: stats.totalErrors,
    },
  };
}

async function processJob(job) {
  const imp = job.impresora ?? {};
  const host = imp.ip?.trim() || process.env.PRINTER_IP?.trim();
  const port = Number(imp.puerto ?? process.env.PRINTER_PORT ?? 9100);
  if (!host) throw new Error("IP de impresora no configurada");

  const data = buildEscPosBuffer(job.ticket, imp.anchoPapel ?? "80mm");
  await printTcp(host, port, data, job.ticket);
}

export async function pollCloudPrintJobs() {
  if (polling) return;
  const client = getClient();
  if (!client || !RESTAURANTE_ID) return;

  polling = true;
  stats.lastPollAt = new Date().toISOString();

  try {
    const { data: jobs, error } = await client
      .from("print_jobs")
      .select("*")
      .eq("restaurante_id", RESTAURANTE_ID)
      .in("status", ["queued", "error"])
      .lt("attempts", 8)
      .order("created_at", { ascending: true })
      .limit(3);

    if (error) {
      stats.lastError = error.message;
      stats.totalErrors += 1;
      console.error(
        `[cloud-poller] Error Supabase al leer print_jobs: ${error.message}`,
      );
      if (error.message?.includes("print_jobs")) {
        console.error(
          "[cloud-poller] ¿Migración aplicada? Ejecute supabase/migrations/20250704_print_jobs.sql",
        );
      }
      return;
    }

    stats.lastJobsFound = jobs?.length ?? 0;
    stats.lastError = null;

    if (!jobs?.length) {
      return;
    }

    console.info(`[cloud-poller] ${jobs.length} job(s) pendiente(s)`);

    for (const job of jobs) {
      await client
        .from("print_jobs")
        .update({ status: "printing", updated_at: new Date().toISOString() })
        .eq("id", job.id);

      try {
        await processJob(job);
        await client
          .from("print_jobs")
          .update({
            status: "printed",
            printed_at: new Date().toISOString(),
            error_message: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.id);
        stats.lastPrintedJobId = job.id;
        stats.totalPrinted += 1;
        console.info(
          `[cloud-poller] Job impreso ${job.id} · destino=${job.destino} · mesa=${job.mesa ?? "—"}`,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error";
        const attempts = (job.attempts ?? 0) + 1;
        await client
          .from("print_jobs")
          .update({
            status: attempts >= 8 ? "error" : "queued",
            error_message: msg,
            attempts,
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.id);
        stats.lastError = msg;
        stats.totalErrors += 1;
        console.warn(
          `[cloud-poller] Fallo job ${job.id} (intento ${attempts}): ${msg}`,
        );
      }
    }
  } finally {
    polling = false;
  }
}

export function startCloudPoller() {
  const missing = missingConfigReason();
  if (missing.length > 0) {
    console.warn(
      `[cloud-poller] INACTIVO — faltan variables: ${missing.join(", ")}`,
    );
    console.warn(
      "[cloud-poller] Sin esto, Vercel encola en Supabase pero el Lenovo no imprime.",
    );
    return;
  }

  stats.startedAt = new Date().toISOString();
  console.info(`[cloud-poller] ACTIVO · cada ${POLL_MS}ms`);
  console.info(`[cloud-poller] Restaurante ${RESTAURANTE_ID}`);
  console.info(`[cloud-poller] Supabase ${SUPABASE_URL}`);

  void pollCloudPrintJobs();
  setInterval(() => void pollCloudPrintJobs(), POLL_MS);
}
