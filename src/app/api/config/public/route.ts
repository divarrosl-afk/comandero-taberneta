import { NextResponse } from "next/server";
import { getDataBackend } from "@/lib/data/backend";
import { getSupabaseEnv, validateSupabaseSetup } from "@/lib/supabase/env";

/** Config pública en runtime (servidor) — evita depender del build para NEXT_PUBLIC_*. */
export async function GET() {
  const setup = validateSupabaseSetup();
  const env = getSupabaseEnv();

  return NextResponse.json({
    ok: setup.ok,
    backend: getDataBackend(),
    missing: setup.missing,
    supabase: env
      ? {
          url: env.url,
          anonKey: env.anonKey,
          restauranteId: env.restauranteId,
        }
      : null,
  });
}
