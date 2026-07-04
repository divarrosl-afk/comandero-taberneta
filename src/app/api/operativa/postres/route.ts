import { NextResponse } from "next/server";
import {
  crearComandaPostres,
  listarComandasPostres,
} from "@/lib/operativa/operativa-server";
import { verifyAuthenticatedRequest } from "@/lib/supabase/api-auth";
import type { ComandaPostres } from "@/types/postres";
import type { ComandaPersistMeta } from "@/lib/supabase/comandas-mappers";

export const runtime = "nodejs";

function bearerToken(request: Request): string {
  return request.headers.get("authorization")!.slice(7);
}

export async function GET(request: Request) {
  const auth = await verifyAuthenticatedRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const comandas = await listarComandasPostres(bearerToken(request));
    return NextResponse.json({ comandas });
  } catch (error) {
    console.error("[operativa/postres/GET]", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las comandas de postres" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await verifyAuthenticatedRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = (await request.json()) as {
      comanda: ComandaPostres;
      meta?: ComandaPersistMeta;
    };
    if (!body.comanda?.id) {
      return NextResponse.json({ error: "Comanda inválida" }, { status: 400 });
    }

    const comanda = await crearComandaPostres(
      bearerToken(request),
      body.comanda,
      body.meta,
    );
    return NextResponse.json({ comanda });
  } catch (error) {
    console.error("[operativa/postres/POST]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo guardar la comanda de postres",
      },
      { status: 500 },
    );
  }
}
