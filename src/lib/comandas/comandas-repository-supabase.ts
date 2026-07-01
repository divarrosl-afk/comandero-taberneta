import { esMismaFecha } from "@/lib/cierre/fecha";
import type { ComandasRepository } from "@/lib/comandas/comandas-repository";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { throwIfSupabaseError } from "@/lib/supabase/errors";
import {
  comandaToRow,
  rowToComandaCocina,
  type ComandaPersistMeta,
  type DbComandaCocina,
} from "@/lib/supabase/comandas-mappers";
import type { ComandaCocina } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";

export const comandasRepositorySupabase: ComandasRepository = {
  async getAll() {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return [];

    const { data, error } = await client
      .from("comandas_cocina")
      .select("*")
      .eq("restaurante_id", env.restauranteId)
      .is("deleted_at", null)
      .order("creada_en", { ascending: false });

    throwIfSupabaseError(error, "Error al cargar comandas");
    if (!data) return [];
    return (data as DbComandaCocina[]).map(rowToComandaCocina);
  },

  async getById(id) {
    const todas = await this.getAll();
    return todas.find((c) => c.id === id);
  },

  async crear(comanda, meta?: ComandaPersistMeta) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) throw new Error("Supabase no configurado");

    const row = comandaToRow(comanda, env.restauranteId, meta);
    const { data, error } = await client
      .from("comandas_cocina")
      .insert(row)
      .select("*")
      .single();

    if (error || !data) throw new Error(error?.message ?? "Error al guardar comanda");
    return rowToComandaCocina(data as DbComandaCocina);
  },

  async actualizar(id, cambios) {
    const actual = await this.getById(id);
    if (!actual) return null;

    const merged = { ...actual, ...cambios };
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return null;

    const row = comandaToRow(merged, env.restauranteId, {
      mesaId: merged.mesa,
      mesaCodigo: String(merged.mesa),
    });

    const { data, error } = await client
      .from("comandas_cocina")
      .update({
        mesa_codigo: row.mesa_codigo,
        mesa_id: row.mesa_id,
        camarero_nombre: row.camarero_nombre,
        tipo_servicio: row.tipo_servicio,
        entrantes: row.entrantes,
        primeros: row.primeros,
        segundos: row.segundos,
        bebidas: row.bebidas,
        extras: row.extras,
        observaciones: row.observaciones,
        estado_panel: row.estado_panel,
        enviada: row.enviada,
      })
      .eq("id", id)
      .eq("restaurante_id", env.restauranteId)
      .select("*")
      .single();

    if (error || !data) return null;
    return rowToComandaCocina(data as DbComandaCocina);
  },

  async actualizarEstado(id, estado: EstadoPanel) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return null;

    const { data, error } = await client
      .from("comandas_cocina")
      .update({ estado_panel: estado })
      .eq("id", id)
      .eq("restaurante_id", env.restauranteId)
      .is("deleted_at", null)
      .select("*")
      .single();

    if (error || !data) return null;
    return rowToComandaCocina(data as DbComandaCocina);
  },

  async eliminar(id) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return false;

    const { error } = await client
      .from("comandas_cocina")
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
      .from("comandas_cocina")
      .select("id, creada_en")
      .eq("restaurante_id", env.restauranteId)
      .is("deleted_at", null);

    throwIfSupabaseError(error, "Error al listar comandas del día");
    if (!data) return 0;

    const ids = data
      .filter((r) => esMismaFecha(r.creada_en as string, fecha))
      .map((r) => r.id as string);

    if (ids.length === 0) return 0;

    const { error: delError } = await client
      .from("comandas_cocina")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", ids)
      .is("deleted_at", null);

    if (delError) throw new Error(delError.message);
    return ids.length;
  },
};
