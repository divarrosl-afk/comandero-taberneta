import { NextResponse } from "next/server";
import { usesRemoteData } from "@/lib/data/backend";
import { countMesas, seedMesasIfEmpty } from "@/lib/setup/seed-mesas";
import { getSupabaseEnv } from "@/lib/supabase/env";

/** Crea mesas por defecto en Supabase si la tabla está vacía (idempotente). */
export async function GET() {
  if (!usesRemoteData()) {
    return NextResponse.json({ ok: true, mesaCount: 0, seeded: false });
  }

  const env = getSupabaseEnv();
  if (!env?.restauranteId) {
    return NextResponse.json(
      { ok: false, error: "restauranteId no configurado" },
      { status: 503 },
    );
  }

  try {
    let mesaCount = await countMesas(env.restauranteId);
    let seeded = false;

    if (mesaCount === 0) {
      const result = await seedMesasIfEmpty(env.restauranteId);
      mesaCount = result.mesaCount;
      seeded = result.seeded;
    }

    return NextResponse.json({ ok: true, mesaCount, seeded });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error de mesas";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
