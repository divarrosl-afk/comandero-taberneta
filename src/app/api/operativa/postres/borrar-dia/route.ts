import { NextResponse } from "next/server";
import { eliminarComandasPostresDelDia } from "@/lib/operativa/operativa-server";
import { verifyAuthenticatedRequest } from "@/lib/supabase/api-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await verifyAuthenticatedRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let fecha = "";
  try {
    const body = (await request.json()) as { fecha?: string };
    fecha = body.fecha?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }

  try {
    const eliminadas = await eliminarComandasPostresDelDia(
      request.headers.get("authorization")!.slice(7),
      fecha,
    );
    return NextResponse.json({ eliminadas });
  } catch (error) {
    console.error("[operativa/postres/borrar-dia]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudieron borrar las comandas de postres del día",
      },
      { status: 500 },
    );
  }
}
