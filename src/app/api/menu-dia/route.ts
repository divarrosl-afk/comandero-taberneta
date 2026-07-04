import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  menuDiaToRow,
  rowToMenuDia,
  type DbMenuDia,
} from "@/lib/supabase/mappers";
import {
  verifyAdminRequest,
  verifyAuthenticatedRequest,
} from "@/lib/supabase/api-auth";
import { MENU_DIA_DEFAULT, type MenuDiaConfig } from "@/types/menu-dia";

export const runtime = "nodejs";

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

async function menuVigente(token: string): Promise<MenuDiaConfig> {
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

  if (activo) {
    const menu = rowToMenuDia(activo as DbMenuDia);
    if (tienePlatosImportados(menu)) return menu;
  }

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

export async function GET(request: Request) {
  const auth = await verifyAuthenticatedRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const menu = await menuVigente(
      request.headers.get("authorization")!.slice(7),
    );
    return NextResponse.json({ menu });
  } catch (error) {
    console.error("[menu-dia/GET]", error);
    return NextResponse.json(
      { error: "No se pudo cargar el menú" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const config = (await request.json()) as MenuDiaConfig;
    const token = request.headers.get("authorization")!.slice(7);
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

    const { error } = await client.from("menus_dia").upsert(row, {
      onConflict: "restaurante_id,fecha",
    });

    if (error) throw new Error(error.message);

    const menu = await menuVigente(token);
    return NextResponse.json({ menu });
  } catch (error) {
    console.error("[menu-dia/PUT]", error);
    return NextResponse.json(
      { error: "No se pudo guardar el menú" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const token = request.headers.get("authorization")!.slice(7);
    const client = clientConToken(token);

    const { error } = await client
      .from("menus_dia")
      .update({ activo: false })
      .eq("restaurante_id", RESTAURANTE_ID)
      .is("deleted_at", null);

    if (error) throw new Error(error.message);

    const vacio: MenuDiaConfig = {
      ...MENU_DIA_DEFAULT,
      fecha: new Date().toISOString().slice(0, 10),
      activo: false,
      primerosImportados: [],
      segundosImportados: [],
    };

    return NextResponse.json({ menu: vacio });
  } catch (error) {
    console.error("[menu-dia/DELETE]", error);
    return NextResponse.json(
      { error: "No se pudo quitar el menú" },
      { status: 500 },
    );
  }
}
