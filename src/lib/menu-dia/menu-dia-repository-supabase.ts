import { getSupabaseClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import {
  menuDiaToRow,
  rowToMenuDia,
  type DbMenuDia,
} from "@/lib/supabase/mappers";
import type { MenuDiaRepository } from "@/lib/menu-dia/menu-dia-repository";
import { MENU_DIA_DEFAULT, type MenuDiaConfig } from "@/types/menu-dia";

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export const menuDiaRepositorySupabase: MenuDiaRepository = {
  async get() {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return MENU_DIA_DEFAULT;

    const fecha = hoyIso();
    const { data, error } = await client
      .from("menus_dia")
      .select("*")
      .eq("restaurante_id", env.restauranteId)
      .eq("fecha", fecha)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !data) {
      const { data: reciente } = await client
        .from("menus_dia")
        .select("*")
        .eq("restaurante_id", env.restauranteId)
        .is("deleted_at", null)
        .order("fecha", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (reciente) return rowToMenuDia(reciente as DbMenuDia);
      return { ...MENU_DIA_DEFAULT, fecha };
    }

    return rowToMenuDia(data as DbMenuDia);
  },

  async save(config) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return;

    const row = menuDiaToRow(config, env.restauranteId);
    const { error } = await client.from("menus_dia").upsert(row, {
      onConflict: "restaurante_id,fecha",
    });
    if (error) throw new Error(error.message);
  },

  async resetDefault() {
    const config = { ...MENU_DIA_DEFAULT, fecha: hoyIso() };
    await this.save(config);
    return config;
  },
};
