import { NextResponse } from "next/server";
import { esMismaFechaRestaurante } from "@/lib/cierre/fecha";
import { verifyAdminRequest } from "@/lib/supabase/api-auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/supabase/env";

export const runtime = "nodejs";

async function softDeleteDelDia(
  tabla: "comandas_cocina" | "comandas_postres",
  restauranteId: string,
  fecha: string,
): Promise<number> {
  const admin = getSupabaseAdminClient();
  if (!admin) return 0;

  const { data, error } = await admin
    .from(tabla)
    .select("id, creada_en")
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null);

  if (error || !data) {
    throw new Error(error?.message ?? `Error al listar ${tabla}`);
  }

  const ids = data
    .filter((row) => esMismaFechaRestaurante(row.creada_en as string, fecha))
    .map((row) => row.id as string);

  if (ids.length === 0) return 0;

  const deletedAt = new Date().toISOString();
  const { error: delError } = await admin
    .from(tabla)
    .update({ deleted_at: deletedAt })
    .in("id", ids)
    .is("deleted_at", null);

  if (delError) throw new Error(delError.message);
  return ids.length;
}

export async function POST(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let fecha = "";
  try {
    const body = (await request.json()) as { fecha?: string };
    fecha = body.fecha?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }

  const env = getSupabaseEnv();
  if (!env?.restauranteId) {
    return NextResponse.json(
      { error: "Restaurante no configurado" },
      { status: 500 },
    );
  }

  if (!getSupabaseAdminClient()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY no configurada en el servidor" },
      { status: 500 },
    );
  }

  try {
    const [cocinaEliminadas, postresEliminados] = await Promise.all([
      softDeleteDelDia("comandas_cocina", env.restauranteId, fecha),
      softDeleteDelDia("comandas_postres", env.restauranteId, fecha),
    ]);

    return NextResponse.json({ cocinaEliminadas, postresEliminados });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al borrar datos del día";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
