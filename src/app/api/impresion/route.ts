import { NextResponse } from "next/server";
import { printMock } from "@/modules/impresion-wifi/drivers/mock";
import { printEscPos } from "@/modules/impresion-wifi/drivers/escpos";
import { getEffectivePrintMode } from "@/modules/impresion-wifi/config";
import { verifyAuthenticatedRequest } from "@/lib/supabase/api-auth";
import type { PrintTicketRequest, PrintResult } from "@/modules/impresion-wifi/types";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi/types";
import { IMPRESORA_DEFAULT } from "@/types/impresora";

const VALID_DESTINOS = new Set(["cocina", "barra", "postres"]);
const VALID_TIPOS = new Set(["cocina", "barra", "postres", "reimpresion"]);

function requiresPrintAuth(): boolean {
  const backend = process.env.NEXT_PUBLIC_DATA_BACKEND?.trim().toLowerCase();
  return backend === "supabase" || backend === "hybrid";
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
    if (requiresPrintAuth()) {
      const auth = await verifyAuthenticatedRequest(req);
      if (!auth.ok) {
        return NextResponse.json(
          {
            ok: false,
            message: auth.error,
            destino: "cocina",
            tipo: "cocina",
            simulated: false,
            mode: "mock",
            timestamp: new Date().toISOString(),
          },
          { status: auth.status },
        );
      }
    }

    let body: PrintTicketRequest;
    try {
      body = (await req.json()) as PrintTicketRequest;
    } catch {
      return NextResponse.json(
        { ok: false, message: "Cuerpo JSON inválido" },
        { status: 400 },
      );
    }

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

    const impresora = body.impresora ?? {
      ...IMPRESORA_DEFAULT,
      ip: process.env.PRINTER_IP?.trim() ?? "",
      puerto: Number(process.env.PRINTER_PORT ?? 9100),
      modo: process.env.PRINT_MODE === "network" ? "network" : "mock",
    };

    body.impresora = impresora;

    if (!impresora.activa) {
      const result: PrintResult = {
        ok: true,
        mode: "mock",
        destino: body.destino,
        tipo: body.tipo,
        message: PRINT_MESSAGES.impresoraInactiva,
        simulated: true,
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(result);
    }

    const mode = getEffectivePrintMode(impresora);

    if (mode === "network") {
      const forwarded = await forwardToPrintServer(body);
      if (forwarded) return NextResponse.json(forwarded);

      const escpos = await printEscPos({
        impresora,
        ticket: body.ticket,
        destino: body.destino,
      });
      if (!escpos.ok) {
        return NextResponse.json(
          {
            ok: false,
            mode: "network",
            destino: body.destino,
            tipo: body.tipo,
            message: escpos.message,
            simulated: false,
            timestamp: new Date().toISOString(),
          },
          { status: 502 },
        );
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
