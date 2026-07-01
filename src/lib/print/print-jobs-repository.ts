import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { PrintTicketRequest } from "@/modules/impresion-wifi/types";
import type { ImpresoraConfig } from "@/types/impresora";

export interface PrintJobRow {
  id: string;
  restaurante_id: string;
  ticket: string;
  destino: string;
  tipo: string;
  impresora: ImpresoraConfig;
  comanda_id: string | null;
  mesa: string | null;
  camarero: string | null;
  status: "queued" | "printing" | "printed" | "error";
  error_message: string | null;
  attempts: number;
  max_attempts: number;
  created_at: string;
  updated_at: string;
  printed_at: string | null;
}

export async function enqueueCloudPrintJob(
  request: PrintTicketRequest,
): Promise<{ job: PrintJobRow | null; error?: string }> {
  const admin = getSupabaseAdminClient();
  const env = getSupabaseEnv();
  if (!admin) {
    return {
      job: null,
      error: "SUPABASE_SERVICE_ROLE_KEY no configurada en el servidor (Vercel)",
    };
  }
  if (!env?.restauranteId) {
    return {
      job: null,
      error: "NEXT_PUBLIC_RESTAURANTE_ID no configurado",
    };
  }

  const { data, error } = await admin
    .from("print_jobs")
    .insert({
      restaurante_id: env.restauranteId,
      ticket: request.ticket,
      destino: request.destino,
      tipo: request.tipo,
      impresora: request.impresora ?? {},
      comanda_id: request.comandaId ?? null,
      mesa: request.mesa ?? null,
      camarero: request.camarero ?? null,
      status: "queued",
    })
    .select("*")
    .single();

  if (error) {
    const hint = error.message.includes("print_jobs")
      ? " — ejecute supabase/migrations/20250704_print_jobs.sql"
      : "";
    console.error("[print_jobs] INSERT falló:", error.message);
    return { job: null, error: `${error.message}${hint}` };
  }
  if (!data) {
    return { job: null, error: "INSERT sin datos devueltos" };
  }
  return { job: data as PrintJobRow };
}

export async function fetchPendingPrintJobs(
  restauranteId: string,
  limit = 10,
): Promise<PrintJobRow[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("print_jobs")
    .select("*")
    .eq("restaurante_id", restauranteId)
    .in("status", ["queued", "error"])
    .lt("attempts", 8)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return data as PrintJobRow[];
}

export async function markPrintJobPrinting(id: string): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  if (!admin) return false;

  const { error } = await admin
    .from("print_jobs")
    .update({ status: "printing", updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["queued", "error"]);

  return !error;
}

export async function markPrintJobPrinted(id: string): Promise<void> {
  const admin = getSupabaseAdminClient();
  if (!admin) return;

  await admin
    .from("print_jobs")
    .update({
      status: "printed",
      printed_at: new Date().toISOString(),
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function markPrintJobError(
  id: string,
  message: string,
  attempts: number,
): Promise<void> {
  const admin = getSupabaseAdminClient();
  if (!admin) return;

  const status = attempts >= 8 ? "error" : "queued";
  await admin
    .from("print_jobs")
    .update({
      status,
      error_message: message,
      attempts,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}
