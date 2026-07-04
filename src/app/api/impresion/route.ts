import { NextResponse } from "next/server";
import { printMock } from "@/modules/impresion-wifi/drivers/mock";
import { getEffectivePrintMode } from "@/modules/impresion-wifi/config";
import { verifyAuthenticatedRequest } from "@/lib/supabase/api-auth";
import { printTicketNetwork } from "@/lib/impresion/print-service";
import type { PrintTicketRequest, PrintResult } from "@/modules/impresion-wifi/types";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi/types";
import { IMPRESORA_DEFAULT, type ImpresoraConfig } from "@/types/impresora";

const VALID_DESTINOS = new Set(["cocina", "barra", "postres"]);
const VALID_TIPOS = new Set(["cocina", "barra", "postres", "reimpresion"]);

function mergeImpresoraConfig(fromClient?: ImpresoraConfig): ImpresoraConfig {
  const base = fromClient ?? { ...IMPRESORA_DEFAULT };
  const envIp = process.env.PRINTER_IP?.trim() ?? "";
  const envPuerto = Number(process.env.PRINTER_PORT ?? 9100);

  return {
    ...IMPRESORA_DEFAULT,
    ...base,
    ip: base.ip?.trim() || envIp,
    puerto: base.puerto > 0 ? base.puerto : envPuerto,
    modo:
      base.modo === "network" || (!base.modo && envIp)
        ? "network"
        : (base.modo ?? IMPRESORA_DEFAULT.modo),
  };
}

function requiresPrintAuth(): boolean {
  const backend = process.env.NEXT_PUBLIC_DATA_BACKEND?.trim().toLowerCase();
  return backend === "supabase" || backend === "hybrid";
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
            mode: "network",
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

    const impresora = mergeImpresoraConfig(body.impresora);

    body.impresora = impresora;

    if (!impresora.activa) {
      const result: PrintResult = {
        ok: true,
        mode: "mock",
        destino: body.destino,
        tipo: body.tipo,
        message: PRINT_MESSAGES.impresoraInactiva,
        simulated: false,
        timestamp: new Date().toISOString(),
        status: "printed",
      };
      return NextResponse.json(result);
    }

    const mode = getEffectivePrintMode(impresora);

    if (mode === "network") {
      const result = await printTicketNetwork(
        impresora,
        body.ticket,
        body,
      );
      return NextResponse.json(result, { status: result.ok ? 200 : 502 });
    }

    const result = printMock(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: PRINT_MESSAGES.error,
        simulated: false,
        mode: "network",
      },
      { status: 500 },
    );
  }
}
