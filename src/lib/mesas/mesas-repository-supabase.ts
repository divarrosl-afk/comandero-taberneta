import { crearMesasDefault } from "@/data/mesas-default";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { mesaToRow, rowToMesa, type DbMesa } from "@/lib/supabase/mappers";
import type { MesasRepository } from "@/lib/mesas/mesas-repository";
import type { MesaConfig } from "@/types/mesas";

export const mesasRepositorySupabase: MesasRepository = {
  async getConfig() {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return crearMesasDefault();

    const { data, error } = await client
      .from("mesas")
      .select("*")
      .eq("restaurante_id", env.restauranteId)
      .is("deleted_at", null)
      .order("zona")
      .order("orden")
      .order("codigo");

    if (error || !data) return [];
    return (data as DbMesa[]).map(rowToMesa);
  },

  async getById(id) {
    const mesas = await this.getConfig();
    return mesas.find((m) => m.id === id);
  },

  async guardarConfig(mesas) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return;

    const rows = mesas.map((m) => mesaToRow(m, env.restauranteId));
    const { error } = await client.from("mesas").upsert(rows, {
      onConflict: "id",
    });
    if (error) throw new Error(error.message);
  },

  async crear(mesa) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) throw new Error("Supabase no configurado");

    const nueva: MesaConfig = {
      ...mesa,
      id: mesa.id || crypto.randomUUID(),
    };
    const row = mesaToRow(nueva, env.restauranteId);
    const { data, error } = await client
      .from("mesas")
      .insert(row)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return rowToMesa(data as DbMesa);
  },

  async actualizar(id, cambios) {
    const actual = await this.getById(id);
    if (!actual) return null;

    const merged = { ...actual, ...cambios, id };
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return null;

    const row = mesaToRow(merged, env.restauranteId);
    const { data, error } = await client
      .from("mesas")
      .update(row)
      .eq("id", id)
      .eq("restaurante_id", env.restauranteId)
      .select("*")
      .single();

    if (error || !data) return null;
    return rowToMesa(data as DbMesa);
  },

  async restaurarDefault() {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return crearMesasDefault();

    await client
      .from("mesas")
      .update({ deleted_at: new Date().toISOString() })
      .eq("restaurante_id", env.restauranteId)
      .is("deleted_at", null);

    const defaults = crearMesasDefault().map((m) => ({
      ...m,
      id: crypto.randomUUID(),
    }));

    const codigoToId = new Map(defaults.map((m) => [m.codigo, m.id]));

    const conVariantes = defaults.map((m) => {
      if (!m.mesaPrincipalId) return m;
      const principalId =
        codigoToId.get(m.mesaPrincipalId) ??
        codigoToId.get(String(m.mesaPrincipalId).toUpperCase());
      return principalId ? { ...m, mesaPrincipalId: principalId } : m;
    });

    await this.guardarConfig(conVariantes);
    return conVariantes;
  },
};
