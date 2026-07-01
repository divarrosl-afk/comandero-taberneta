import { getSupabaseClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import {
  impresoraConfigToRow,
  rowToImpresoraConfig,
  type DbConfigImpresora,
} from "@/lib/supabase/mappers";
import type { ImpresoraConfigRepository } from "@/lib/impresora/impresora-config-repository";
import { IMPRESORA_DEFAULT } from "@/types/impresora";

export const impresoraConfigRepositorySupabase: ImpresoraConfigRepository = {
  async get() {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return IMPRESORA_DEFAULT;

    const { data, error } = await client
      .from("config_impresora")
      .select("*")
      .eq("restaurante_id", env.restauranteId)
      .maybeSingle();

    if (error || !data) return IMPRESORA_DEFAULT;
    return rowToImpresoraConfig(data as DbConfigImpresora);
  },

  async save(config) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return;

    const row = impresoraConfigToRow(config, env.restauranteId);
    const { error } = await client
      .from("config_impresora")
      .upsert(row, { onConflict: "restaurante_id" });
    if (error) throw new Error(error.message);
  },

  async reset() {
    await this.save(IMPRESORA_DEFAULT);
    return IMPRESORA_DEFAULT;
  },
};
