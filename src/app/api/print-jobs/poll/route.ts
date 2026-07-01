import { NextResponse } from "next/server";
import {
  fetchPendingPrintJobs,
  markPrintJobError,
  markPrintJobPrinted,
  markPrintJobPrinting,
} from "@/lib/print/print-jobs-repository";
import { buildEscPosBuffer } from "@/lib/impresion/escpos-encode";
import { printTicket } from "@/lib/impresion/escpos-network";
import { getSupabaseEnv } from "@/lib/supabase/env";

function authorizePoller(req: Request): boolean {
  const expected = process.env.PRINT_POLL_API_KEY?.trim();
  if (!expected) return process.env.NODE_ENV !== "production";
  const key = req.headers.get("x-print-poll-key");
  return key === expected;
}

/** GET — trabajos pendientes para el print-server del restaurante. */
export async function GET(req: Request) {
  if (!authorizePoller(req)) {
    return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
  }

  const env = getSupabaseEnv();
  if (!env?.restauranteId) {
    return NextResponse.json(
      { ok: false, message: "Supabase no configurado" },
      { status: 503 },
    );
  }

  const jobs = await fetchPendingPrintJobs(env.restauranteId, 5);
  return NextResponse.json({ ok: true, jobs });
}

/** POST — procesa el siguiente trabajo pendiente. */
export async function POST(req: Request) {
  if (!authorizePoller(req)) {
    return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
  }

  let body: { jobId?: string };
  try {
    body = (await req.json()) as { jobId?: string };
  } catch {
    return NextResponse.json({ ok: false, message: "JSON inválido" }, { status: 400 });
  }

  const env = getSupabaseEnv();
  if (!env?.restauranteId) {
    return NextResponse.json({ ok: false, message: "Sin config" }, { status: 503 });
  }

  const jobs = await fetchPendingPrintJobs(env.restauranteId, 5);
  const job = jobs.find((j) => !body.jobId || j.id === body.jobId) ?? jobs[0];
  if (!job) {
    return NextResponse.json({ ok: true, message: "Sin trabajos pendientes" });
  }

  await markPrintJobPrinting(job.id);
  const impresora = job.impresora;
  const buffer = buildEscPosBuffer(job.ticket, impresora.anchoPapel ?? "80mm");
  const result = await printTicket(
    impresora.ip,
    impresora.puerto ?? 9100,
    buffer,
    job.ticket,
  );

  const attempts = job.attempts + 1;
  if (result.success) {
    await markPrintJobPrinted(job.id);
    return NextResponse.json({ ok: true, jobId: job.id, status: "printed" });
  }

  await markPrintJobError(job.id, result.error ?? "Error", attempts);
  return NextResponse.json(
    { ok: false, jobId: job.id, message: result.error },
    { status: 502 },
  );
}
