import { crearCatalogoDefault } from "@/data/catalogo-default";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { productoToRow } from "@/lib/supabase/mappers";

export async function countProductos(restauranteId: string): Promise<number> {
  const admin = getSupabaseAdminClient();
  if (!admin) return 0;
  const { count } = await admin
    .from("productos")
    .select("*", { count: "exact", head: true })
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null);
  return count ?? 0;
}

export async function seedCatalogoIfEmpty(
  restauranteId?: string,
): Promise<{ seeded: boolean; productCount: number }> {
  const admin = getSupabaseAdminClient();
  const env = getSupabaseEnv();
  const rid = restauranteId?.trim() || env?.restauranteId || "";

  if (!admin || !rid) {
    throw new Error("Supabase admin o restauranteId no configurado");
  }

  const existing = await countProductos(rid);
  if (existing > 0) {
    return { seeded: false, productCount: existing };
  }

  const defaults = crearCatalogoDefault();
  const rows = defaults.map((p) => productoToRow(p, rid));
  const { error } = await admin.from("productos").upsert(rows, {
    onConflict: "id",
  });

  if (error) throw new Error(`Catálogo: ${error.message}`);

  return { seeded: true, productCount: defaults.length };
}
