import { NextResponse } from "next/server";
import { verifyAuthenticatedRequest } from "@/lib/supabase/api-auth";
import {
  forwardTestToPrintServer,
  testPrinterNetwork,
} from "@/lib/impresion/print-service";
import { probePrinter } from "@/lib/impresion/escpos-network";
import { IMPRESORA_DEFAULT } from "@/types/impresora";
import type { ImpresoraConfig } from "@/types/impresora";

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
          { success: false, error: auth.error, message: auth.error },
          { status: auth.status },
        );
      }
    }

    let body: { impresora?: ImpresoraConfig };
    try {
      body = (await req.json()) as { impresora?: ImpresoraConfig };
    } catch {
      return NextResponse.json(
        { success: false, error: "JSON inválido", message: "JSON inválido" },
        { status: 400 },
      );
    }

    const impresora: ImpresoraConfig = {
      ...IMPRESORA_DEFAULT,
      ...body.impresora,
      modo: "network",
    };

    const url = new URL(req.url);
    const probeOnly = url.searchParams.get("probe") === "1";
    const advanced = url.searchParams.get("advanced") === "1";

    if (!impresora.activa) {
      return NextResponse.json({
        success: false,
        error: "Impresora inactiva",
        message: "Impresora inactiva",
      });
    }

    if (probeOnly) {
      const viaServer = await forwardTestToPrintServer(impresora);
      if (viaServer) {
        return NextResponse.json(
          {
            success: viaServer.success,
            error: viaServer.error,
            message: viaServer.success
              ? "Impresora conectada"
              : viaServer.message,
            timestamp: new Date().toISOString(),
          },
          { status: viaServer.success ? 200 : 502 },
        );
      }

      const probe = await probePrinter(impresora.ip, impresora.puerto);
      return NextResponse.json(
        {
          success: probe.success,
          error: probe.error,
          message: probe.success
            ? "Impresora conectada"
            : (probe.error ?? "No se pudo conectar"),
          timestamp: new Date().toISOString(),
        },
        { status: probe.success ? 200 : 502 },
      );
    }

    const result = await testPrinterNetwork(impresora, { advanced });

    return NextResponse.json(
      {
        success: result.success,
        error: result.error,
        message: result.message,
        timestamp: new Date().toISOString(),
      },
      { status: result.success ? 200 : 502 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error interno";
    return NextResponse.json(
      { success: false, error: msg, message: "No se pudo conectar" },
      { status: 500 },
    );
  }
}
