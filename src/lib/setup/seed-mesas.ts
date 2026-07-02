import { crearMesasDefault } from "@/data/mesas-default";
import { createId } from "@/lib/id/create-id";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { mesaToRow } from "@/lib/supabase/mappers";

export async function countMesas(restauranteId: string): Promise<number> {
  const admin = getSupabaseAdminClient();
  if (!admin) return 0;
  const { count } = await admin
    .from("mesas")
    .select("*", { count: "exact", head: true })
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null);
  return count ?? 0;
}

export async function seedMesasIfEmpty(
  restauranteId?: string,
): Promise<{ seeded: boolean; mesaCount: number }> {
  const admin = getSupabaseAdminClient();
  const env = getSupabaseEnv();
  const rid = restauranteId?.trim() || env?.restauranteId || "";

  if (!admin || !rid) {
    throw new Error("Supabase admin o restauranteId no configurado");
  }

  const existing = await countMesas(rid);
  if (existing > 0) {
    return { seeded: false, mesaCount: existing };
  }

  const defaults = crearMesasDefault().map((m) => ({
    ...m,
    id: createId(),
  }));

  const codigoToId = new Map(defaults.map((m) => [m.codigo, m.id]));

  const conVariantes = defaults.map((m) => {
    if (!m.mesaPrincipalId) return m;
    const principalId =
      codigoToId.get(m.mesaPrincipalId) ??
      codigoToId.get(String(m.mesaPrincipalId).toUpperCase());
    return principalId ? { ...m, mesaPrincipalId: principalId } : m;
  });

  const rows = conVariantes.map((m) => mesaToRow(m, rid));
  const { error } = await admin.from("mesas").upsert(rows, {
    onConflict: "id",
  });

  if (error) throw new Error(`Mesas: ${error.message}`);

  return { seeded: true, mesaCount: conVariantes.length };
}
