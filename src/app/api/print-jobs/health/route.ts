import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv, validateSupabaseSetup } from "@/lib/supabase/env";

/** Diagnóstico del flujo cloud print_jobs (Vercel). Sin secretos. */
export async function GET() {
  const setup = validateSupabaseSetup();
  const env = getSupabaseEnv();
  const admin = getSupabaseAdminClient();
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const isVercel = process.env.VERCEL === "1";

  let tableOk = false;
  let tableError: string | null = null;
  let pendingCount = 0;

  if (admin && env?.restauranteId) {
    const { count, error } = await admin
      .from("print_jobs")
      .select("*", { count: "exact", head: true })
      .eq("restaurante_id", env.restauranteId)
      .in("status", ["queued", "error"]);

    if (error) {
      tableError = error.message;
    } else {
      tableOk = true;
      pendingCount = count ?? 0;
    }
  }

  const cloudPrintReady =
    setup.ok && hasServiceRole && tableOk && isVercel;

  return NextResponse.json({
    ok: cloudPrintReady,
    runtime: isVercel ? "vercel" : "local",
    supabase: {
      publicEnvOk: setup.ok,
      missing: setup.missing,
      restauranteId: env?.restauranteId ?? null,
      serviceRoleConfigured: hasServiceRole,
    },
    printJobs: {
      tableExists: tableOk,
      tableError,
      pendingCount,
      migration: "supabase/migrations/20250704_print_jobs.sql",
    },
    flow:
      "Móvil → Vercel /api/impresion → Supabase print_jobs → Lenovo cloud-poller → impresora",
    lenovoCheck: "curl http://localhost:3100/health → cloudPolling:true",
  });
}
