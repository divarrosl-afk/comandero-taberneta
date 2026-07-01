/**
 * Polling de print_jobs en Supabase (modo Vercel / nube).
 * El Lenovo solo necesita salida a Internet hacia Supabase.
 */
import { createClient } from "@supabase/supabase-js";
import { buildEscPosBuffer } from "./escpos.js";
import { printTcp } from "./escpos.js";

const POLL_MS = Number(process.env.CLOUD_POLL_MS ?? 3000);
const RESTAURANTE_ID = process.env.SUPABASE_RESTAURANTE_ID?.trim();
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

let supabase = null;
let polling = false;

function getClient() {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabase;
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
  try {
    const { data: jobs, error } = await client
      .from("print_jobs")
      .select("*")
      .eq("restaurante_id", RESTAURANTE_ID)
      .in("status", ["queued", "error"])
      .lt("attempts", 8)
      .order("created_at", { ascending: true })
      .limit(3);

    if (error || !jobs?.length) return;

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
        console.info(`[cloud-poller] Impreso job ${job.id}`);
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
        console.warn(`[cloud-poller] Fallo job ${job.id}: ${msg}`);
      }
    }
  } finally {
    polling = false;
  }
}

export function startCloudPoller() {
  if (!getClient() || !RESTAURANTE_ID) {
    console.info(
      "[cloud-poller] Inactivo — configure SUPABASE_SERVICE_ROLE_KEY y SUPABASE_RESTAURANTE_ID",
    );
    return;
  }
  console.info(`[cloud-poller] Activo cada ${POLL_MS}ms · restaurante ${RESTAURANTE_ID}`);
  void pollCloudPrintJobs();
  setInterval(() => void pollCloudPrintJobs(), POLL_MS);
}
