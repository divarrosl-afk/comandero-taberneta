import { NextResponse } from "next/server";
import {
  actualizarComandaPostres,
  actualizarEstadoComandaPostres,
  eliminarComandaPostres,
} from "@/lib/operativa/operativa-server";
import { verifyAuthenticatedRequest } from "@/lib/supabase/api-auth";
import type { ComandaPostres } from "@/types/postres";
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
      | Partial<ComandaPostres>;

    const token = bearerToken(request);
    let comanda: ComandaPostres | null;

    if (
      "estadoPanel" in body &&
      Object.keys(body).length === 1 &&
      body.estadoPanel !== undefined
    ) {
      comanda = await actualizarEstadoComandaPostres(
        token,
        id,
        body.estadoPanel,
      );
    } else {
      comanda = await actualizarComandaPostres(token, id, body);
    }

    if (!comanda) {
      return NextResponse.json({ error: "Comanda no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ comanda });
  } catch (error) {
    console.error("[operativa/postres/PATCH]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar la comanda de postres",
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
    await eliminarComandaPostres(bearerToken(request), id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[operativa/postres/DELETE]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo eliminar la comanda de postres",
      },
      { status: 500 },
    );
  }
}
