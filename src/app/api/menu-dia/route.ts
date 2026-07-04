import { NextResponse } from "next/server";
import {
  guardarMenuConToken,
  menuVigenteConToken,
  quitarMenuActivo,
} from "@/lib/menu-dia/menu-dia-server";
import {
  verifyAdminRequest,
  verifyAuthenticatedRequest,
} from "@/lib/supabase/api-auth";
import { MENU_DIA_DEFAULT, type MenuDiaConfig } from "@/types/menu-dia";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await verifyAuthenticatedRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const menu = await menuVigenteConToken(
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
    const menu = await guardarMenuConToken(
      request.headers.get("authorization")!.slice(7),
      config,
    );
    return NextResponse.json({ menu });
  } catch (error) {
    console.error("[menu-dia/PUT]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo guardar el menú",
      },
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
    const menu = await quitarMenuActivo(token);
    return NextResponse.json({ menu });
  } catch (error) {
    console.error("[menu-dia/DELETE]", error);
    return NextResponse.json(
      { error: "No se pudo quitar el menú" },
      { status: 500 },
    );
  }
}
