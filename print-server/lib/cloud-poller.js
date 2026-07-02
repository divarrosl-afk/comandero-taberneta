/**
 * Polling de print_jobs en Supabase (modo Vercel / nube).
 * El Lenovo solo necesita salida a Internet hacia Supabase.
 */
import { createClient } from "@supabase/supabase-js";
import { buildEscPosBuffer, printTcp } from "./escpos.js";
import {
  getMissingCloudEnv,
  isSupabaseConfigured,
  readCloudEnv,
} from "./supabase-env.js";

let supabase = null;
let supabaseKey = "";
let polling = false;
let pollerStarted = false;

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
  const { supabaseUrl, serviceRoleKey } = readCloudEnv();
  if (!supabaseUrl || !serviceRoleKey) return null;

  if (!supabase || supabaseKey !== serviceRoleKey) {
    supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    supabaseKey = serviceRoleKey;
  }

  return supabase;
}

/** Estado público para /health (sin secretos). */
export function getCloudPollerStatus() {
  const { supabaseUrl, serviceRoleKey, restauranteId, pollMs } = readCloudEnv();
  const missingEnv = getMissingCloudEnv();
  const configured = isSupabaseConfigured();
  const active = configured && pollerStarted;

  return {
    cloudPolling: active,
    cloudPollMs: pollMs,
    supabaseConfigured: configured,
    missingCloudEnv: missingEnv,
    pollIntervalMs: pollMs,
    restauranteIdConfigured: Boolean(restauranteId),
    supabaseUrlConfigured: Boolean(supabaseUrl),
    serviceRoleConfigured: Boolean(serviceRoleKey),
    missingEnv,
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

  const { restauranteId } = readCloudEnv();
  const client = getClient();
  if (!client || !restauranteId) return;

  polling = true;
  stats.lastPollAt = new Date().toISOString();

  try {
    const { data: jobs, error } = await client
      .from("print_jobs")
      .select("*")
      .eq("restaurante_id", restauranteId)
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
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    stats.lastError = msg;
    stats.totalErrors += 1;
    console.error(`[cloud-poller] Error inesperado: ${msg}`);
  } finally {
    polling = false;
  }
}

export function startCloudPoller() {
  const missing = getMissingCloudEnv();
  if (missing.length > 0) {
    pollerStarted = false;
    console.warn(
      `[cloud-poller] INACTIVO — faltan variables: ${missing.join(", ")}`,
    );
    console.warn(
      "[cloud-poller] Sin esto, Vercel encola en Supabase pero el Lenovo no imprime.",
    );
    return { started: false, missing };
  }

  const { supabaseUrl, restauranteId, pollMs } = readCloudEnv();
  pollerStarted = true;
  stats.startedAt = new Date().toISOString();

  console.info(`[cloud-poller] ACTIVO · cada ${pollMs}ms`);
  console.info(`[cloud-poller] Restaurante ${restauranteId}`);
  console.info(`[cloud-poller] Supabase ${supabaseUrl}`);

  void pollCloudPrintJobs().catch((err) => {
    console.error(
      "[cloud-poller] Error en primer poll:",
      err instanceof Error ? err.message : err,
    );
  });

  setInterval(() => {
    void pollCloudPrintJobs().catch((err) => {
      console.error(
        "[cloud-poller] Error en poll:",
        err instanceof Error ? err.message : err,
      );
    });
  }, pollMs);

  return { started: true, missing: [] };
}
