import { NextResponse } from "next/server";
import {
  actualizarComandaCocina,
  actualizarEstadoComandaCocina,
  eliminarComandaCocina,
} from "@/lib/operativa/operativa-server";
import { verifyAuthenticatedRequest } from "@/lib/supabase/api-auth";
import type { ComandaCocina } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";

export const runtime = "nodejs";

function bearerToken(request: Request): string {
  return request.headers.get("authorization")!.slice(7);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyAuthenticatedRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  try {
    const body = (await request.json()) as
      | { estadoPanel: EstadoPanel }
      | Partial<ComandaCocina>;

    const token = bearerToken(request);
    let comanda: ComandaCocina | null;

    if (
      "estadoPanel" in body &&
      Object.keys(body).length === 1 &&
      body.estadoPanel !== undefined
    ) {
      comanda = await actualizarEstadoComandaCocina(
        token,
        id,
        body.estadoPanel,
      );
    } else {
      comanda = await actualizarComandaCocina(token, id, body);
    }

    if (!comanda) {
      return NextResponse.json({ error: "Comanda no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ comanda });
  } catch (error) {
    console.error("[operativa/cocina/PATCH]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar la comanda",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyAuthenticatedRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  try {
    await eliminarComandaCocina(bearerToken(request), id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[operativa/cocina/DELETE]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo eliminar la comanda",
      },
      { status: 500 },
    );
  }
}
