import { createClient } from "@supabase/supabase-js";
import {
  menuDiaToRow,
  rowToMenuDia,
  type DbMenuDia,
} from "@/lib/supabase/mappers";
import { isMissingImportColumnsError } from "@/lib/menu-dia/menu-importados-payload";
import { MENU_DIA_DEFAULT, type MenuDiaConfig } from "@/types/menu-dia";

const RESTAURANTE_ID =
  process.env.NEXT_PUBLIC_RESTAURANTE_ID?.trim() ?? "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "";

function clientConToken(token: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

function tienePlatosImportados(config: MenuDiaConfig): boolean {
  return (
    (config.primerosImportados?.length ?? 0) > 0 ||
    (config.segundosImportados?.length ?? 0) > 0
  );
}

export async function menuVigenteConToken(
  token: string,
): Promise<MenuDiaConfig> {
  const client = clientConToken(token);

  const { data: activo } = await client
    .from("menus_dia")
    .select("*")
    .eq("restaurante_id", RESTAURANTE_ID)
    .eq("activo", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activo) return rowToMenuDia(activo as DbMenuDia);

  const { data: reciente } = await client
    .from("menus_dia")
    .select("*")
    .eq("restaurante_id", RESTAURANTE_ID)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (reciente) return rowToMenuDia(reciente as DbMenuDia);

  return { ...MENU_DIA_DEFAULT, fecha: new Date().toISOString().slice(0, 10) };
}

export async function quitarMenuActivo(token: string): Promise<MenuDiaConfig> {
  const client = clientConToken(token);

  const { error } = await client
    .from("menus_dia")
    .update({ activo: false })
    .eq("restaurante_id", RESTAURANTE_ID)
    .is("deleted_at", null);

  if (error) throw new Error(error.message);

  return {
    ...MENU_DIA_DEFAULT,
    fecha: new Date().toISOString().slice(0, 10),
    activo: false,
    primerosImportados: [],
    segundosImportados: [],
  };
}

export async function guardarMenuConToken(
  token: string,
  config: MenuDiaConfig,
): Promise<MenuDiaConfig> {
  const client = clientConToken(token);
  const row = menuDiaToRow(config, RESTAURANTE_ID);

  if (config.activo && tienePlatosImportados(config)) {
    const { error: offError } = await client
      .from("menus_dia")
      .update({ activo: false })
      .eq("restaurante_id", RESTAURANTE_ID)
      .neq("fecha", config.fecha)
      .is("deleted_at", null);

    if (offError) throw new Error(offError.message);
  }

  let { error } = await client.from("menus_dia").upsert(row, {
    onConflict: "restaurante_id,fecha",
  });

  if (error && isMissingImportColumnsError(error.message)) {
    const legacyRow = menuDiaToRow(config, RESTAURANTE_ID, {
      sinColumnasImportadas: true,
    });
    ({ error } = await client.from("menus_dia").upsert(legacyRow, {
      onConflict: "restaurante_id,fecha",
    }));
  }

  if (error) throw new Error(error.message);
  return menuVigenteConToken(token);
}
