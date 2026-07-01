import { esMismaFecha } from "@/lib/cierre/fecha";
import type { PostresRepository } from "@/lib/postres/postres-repository";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { throwIfSupabaseError } from "@/lib/supabase/errors";
import {
  comandaPostresToRow,
  rowToComandaPostres,
  type ComandaPersistMeta,
  type DbComandaPostres,
} from "@/lib/supabase/comandas-mappers";
import type { EstadoPanel } from "@/types/panel";

export const postresRepositorySupabase: PostresRepository = {
  async getAll() {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return [];

    const { data, error } = await client
      .from("comandas_postres")
      .select("*")
      .eq("restaurante_id", env.restauranteId)
      .is("deleted_at", null)
      .order("creada_en", { ascending: false });

    throwIfSupabaseError(error, "Error al cargar postres");
    if (!data) return [];
    return (data as DbComandaPostres[]).map(rowToComandaPostres);
  },

  async getById(id) {
    const todas = await this.getAll();
    return todas.find((c) => c.id === id);
  },

  async crear(comanda, meta?: ComandaPersistMeta) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) throw new Error("Supabase no configurado");

    const row = comandaPostresToRow(comanda, env.restauranteId, meta);
    const { data, error } = await client
      .from("comandas_postres")
      .insert(row)
      .select("*")
      .single();

    if (error || !data) throw new Error(error?.message ?? "Error al guardar postres");
    return rowToComandaPostres(data as DbComandaPostres);
  },

  async actualizar(id, cambios) {
    const actual = await this.getById(id);
    if (!actual) return null;

    const merged = { ...actual, ...cambios };
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return null;

    const row = comandaPostresToRow(merged, env.restauranteId, {
      mesaId: merged.mesa,
      mesaCodigo: String(merged.mesa),
    });

    const { data, error } = await client
      .from("comandas_postres")
      .update({
        mesa_codigo: row.mesa_codigo,
        mesa_id: row.mesa_id,
        camarero_nombre: row.camarero_nombre,
        postres: row.postres,
        estado_x: row.estado_x,
        cl_h: row.cl_h,
        observaciones: row.observaciones,
        estado_panel: row.estado_panel,
        enviada: row.enviada,
      })
      .eq("id", id)
      .eq("restaurante_id", env.restauranteId)
      .select("*")
      .single();

    if (error || !data) return null;
    return rowToComandaPostres(data as DbComandaPostres);
  },

  async actualizarEstado(id, estado: EstadoPanel) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return null;

    const { data, error } = await client
      .from("comandas_postres")
      .update({ estado_panel: estado })
      .eq("id", id)
      .eq("restaurante_id", env.restauranteId)
      .is("deleted_at", null)
      .select("*")
      .single();

    if (error || !data) return null;
    return rowToComandaPostres(data as DbComandaPostres);
  },

  async eliminar(id) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return false;

    const { error } = await client
      .from("comandas_postres")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("restaurante_id", env.restauranteId)
      .is("deleted_at", null);

    if (error) throw new Error(error.message);
    return true;
  },

  async eliminarDelDia(fecha) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return 0;

    const { data, error } = await client
      .from("comandas_postres")
      .select("id, creada_en")
      .eq("restaurante_id", env.restauranteId)
      .is("deleted_at", null);

    throwIfSupabaseError(error, "Error al listar postres del día");
    if (!data) return 0;

    const ids = data
      .filter((r) => esMismaFecha(r.creada_en as string, fecha))
      .map((r) => r.id as string);

    if (ids.length === 0) return 0;

    const { error: delError } = await client
      .from("comandas_postres")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", ids)
      .is("deleted_at", null);

    if (delError) throw new Error(delError.message);
    return ids.length;
  },
};
