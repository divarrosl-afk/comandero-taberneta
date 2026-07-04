import { getSupabaseClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import {
  menuDiaToRow,
  rowToMenuDia,
  type DbMenuDia,
} from "@/lib/supabase/mappers";
import { isMissingImportColumnsError } from "@/lib/menu-dia/menu-importados-payload";
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

    const { data: activo } = await client
      .from("menus_dia")
      .select("*")
      .eq("restaurante_id", env.restauranteId)
      .eq("activo", true)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activo) return rowToMenuDia(activo as DbMenuDia);

    const { data: reciente } = await client
      .from("menus_dia")
      .select("*")
      .eq("restaurante_id", env.restauranteId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (reciente) return rowToMenuDia(reciente as DbMenuDia);
    return { ...MENU_DIA_DEFAULT, fecha: hoyIso() };
  },

  async save(config) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return;

    const row = menuDiaToRow(config, env.restauranteId);
    let { error } = await client.from("menus_dia").upsert(row, {
      onConflict: "restaurante_id,fecha",
    });

    if (error && isMissingImportColumnsError(error.message)) {
      const legacyRow = menuDiaToRow(config, env.restauranteId, {
        sinColumnasImportadas: true,
      });
      ({ error } = await client.from("menus_dia").upsert(legacyRow, {
        onConflict: "restaurante_id,fecha",
      }));
    }

    if (error) throw new Error(error.message);
  },

  async resetDefault() {
    const config = { ...MENU_DIA_DEFAULT, fecha: hoyIso() };
    await this.save(config);
    return config;
  },
};
