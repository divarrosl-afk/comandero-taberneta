import { NextResponse } from "next/server";
import { printMock } from "@/modules/impresion-wifi/drivers/mock";
import type { PrintTicketRequest, PrintResult } from "@/modules/impresion-wifi/types";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi/types";

const VALID_DESTINOS = new Set(["cocina", "barra", "postres"]);
const VALID_TIPOS = new Set(["cocina", "barra", "postres", "reimpresion"]);

function getServerPrintMode(): "mock" | "network" {
  return process.env.PRINT_MODE === "network" ? "network" : "mock";
}

async function forwardToPrintServer(
  request: PrintTicketRequest,
): Promise<PrintResult | null> {
  const serverUrl = process.env.PRINT_SERVER_URL?.trim();
  if (!serverUrl) return null;

  try {
    const response = await fetch(`${serverUrl.replace(/\/$/, "")}/print`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return (await response.json()) as PrintResult;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PrintTicketRequest;

    if (!body.ticket?.trim()) {
      return NextResponse.json(
        { ok: false, message: "Ticket vacío" },
        { status: 400 },
      );
    }

    if (!VALID_DESTINOS.has(body.destino)) {
      return NextResponse.json(
        { ok: false, message: "Destino inválido" },
        { status: 400 },
      );
    }

    if (!VALID_TIPOS.has(body.tipo)) {
      body.tipo = body.destino;
    }

    const mode = getServerPrintMode();

    if (mode === "network") {
      const forwarded = await forwardToPrintServer(body);
      if (forwarded) {
        return NextResponse.json(forwarded);
      }
    }

    const result = printMock(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: PRINT_MESSAGES.error,
        simulated: true,
        mode: "mock",
      },
      { status: 500 },
    );
  }
}
