import { NextResponse } from "next/server";
import { usesRemoteData } from "@/lib/data/backend";
import { countProductos, seedCatalogoIfEmpty } from "@/lib/setup/seed-catalogo";
import { getSupabaseEnv } from "@/lib/supabase/env";

/** Crea el catálogo por defecto en Supabase si está vacío (idempotente). */
export async function GET() {
  if (!usesRemoteData()) {
    return NextResponse.json({ ok: true, productCount: 0, seeded: false });
  }

  const env = getSupabaseEnv();
  if (!env?.restauranteId) {
    return NextResponse.json(
      { ok: false, error: "restauranteId no configurado" },
      { status: 503 },
    );
  }

  try {
    let productCount = await countProductos(env.restauranteId);
    let seeded = false;

    if (productCount === 0) {
      const result = await seedCatalogoIfEmpty(env.restauranteId);
      productCount = result.productCount;
      seeded = result.seeded;
    }

    return NextResponse.json({ ok: true, productCount, seeded });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error de catálogo";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
