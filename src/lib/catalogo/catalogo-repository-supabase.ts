import { migrarProducto } from "@/lib/carta/migrate-producto";
import { crearCatalogoDefault } from "@/data/catalogo-default";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import {
  productoToRow,
  rowToProducto,
  type DbProducto,
} from "@/lib/supabase/mappers";
import type { CatalogoRepository } from "@/lib/catalogo/catalogo-repository";
import type { ProductoCatalogo, SeccionCatalogo } from "@/types/catalogo";

function ordenarProductos(a: ProductoCatalogo, b: ProductoCatalogo): number {
  if (a.orden !== b.orden) return a.orden - b.orden;
  if (a.favorito !== b.favorito) return a.favorito ? -1 : 1;
  return a.nombre.localeCompare(b.nombre, "es");
}

export const catalogoRepositorySupabase: CatalogoRepository = {
  async getAll() {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return crearCatalogoDefault();

    const { data, error } = await client
      .from("productos")
      .select("*")
      .eq("restaurante_id", env.restauranteId)
      .is("deleted_at", null)
      .order("orden")
      .order("nombre");

    if (error) {
      console.error("[catalogo] getAll:", error.message);
      return crearCatalogoDefault();
    }
    if (!data?.length) return [];
    return (data as DbProducto[]).map(rowToProducto);
  },

  async saveAll(productos) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return;

    const rows = productos.map((p) => productoToRow(p, env.restauranteId));
    const { error } = await client.from("productos").upsert(rows, {
      onConflict: "id",
    });
    if (error) throw new Error(error.message);
  },

  async agregar(producto) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return;

    const row = productoToRow(migrarProducto(producto), env.restauranteId);
    const { error } = await client.from("productos").upsert([row], {
      onConflict: "id",
    });
    if (error) throw new Error(error.message);
  },

  async eliminar(id) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return;

    const { error } = await client
      .from("productos")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("restaurante_id", env.restauranteId)
      .is("deleted_at", null);

    if (error) throw new Error(error.message);
  },

  async resetDefault() {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return crearCatalogoDefault();

    await client
      .from("productos")
      .update({ deleted_at: new Date().toISOString() })
      .eq("restaurante_id", env.restauranteId)
      .is("deleted_at", null);

    const defaults = crearCatalogoDefault();
    await this.saveAll(defaults);
    return defaults;
  },

  async getBySeccion(seccion, opts) {
    const soloActivos = opts?.soloActivos ?? true;
    const soloFavoritos = opts?.soloFavoritos ?? false;
    const todos = await this.getAll();
    return todos
      .filter((p) => p.seccion === seccion)
      .filter((p) => (soloActivos ? p.activo : true))
      .filter((p) => (soloFavoritos ? p.favorito : true))
      .sort(ordenarProductos);
  },

  async getById(id) {
    const todos = await this.getAll();
    return todos.find((p) => p.id === id);
  },
};
