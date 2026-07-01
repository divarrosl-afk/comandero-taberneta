import {
  printTicketText,
  testPrinter,
} from "@/lib/impresion/escpos-network";
import type { ImpresoraConfig } from "@/types/impresora";
import type { PrintTicketRequest, PrintResult } from "@/modules/impresion-wifi/types";

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

function getPrintServerUrl(): string | null {
  const url =
    process.env.PRINT_SERVER_URL?.trim() ||
    process.env.NEXT_PUBLIC_PRINT_SERVER_URL?.trim();
  return url || null;
}

export async function forwardToPrintServer(
  request: PrintTicketRequest,
): Promise<PrintResult | null> {
  const serverUrl = getPrintServerUrl();
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

export async function forwardTestToPrintServer(
  impresora: ImpresoraConfig,
): Promise<{ success: boolean; error?: string; message: string } | null> {
  const serverUrl = getPrintServerUrl();
  if (!serverUrl) return null;

  try {
    const response = await fetch(
      `${serverUrl.replace(/\/$/, "")}/test-connection`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ impresora }),
      },
    );
    const data = (await response.json()) as {
      ok: boolean;
      message: string;
    };
    return {
      success: data.ok,
      error: data.ok ? undefined : data.message,
      message: data.ok ? "Impresora conectada" : data.message,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error de red";
    return {
      success: false,
      error: msg,
      message: `No se alcanza el print-server: ${msg}`,
    };
  }
}

export async function printTicketNetwork(
  impresora: ImpresoraConfig,
  ticket: string,
  meta: Pick<PrintTicketRequest, "destino" | "tipo">,
): Promise<PrintResult> {
  const timestamp = new Date().toISOString();

  if (!impresora.ip?.trim()) {
    return {
      ok: false,
      mode: "network",
      destino: meta.destino,
      tipo: meta.tipo,
      message: "Configure la IP de la impresora",
      simulated: false,
      timestamp,
      status: "error",
    };
  }

  const request: PrintTicketRequest = {
    ticket,
    destino: meta.destino,
    tipo: meta.tipo,
    impresora,
  };

  const forwarded = await forwardToPrintServer(request);
  if (forwarded) {
    return { ...forwarded, simulated: false, mode: "network" };
  }

  if (isVercelRuntime()) {
    return {
      ok: false,
      mode: "network",
      destino: meta.destino,
      tipo: meta.tipo,
      message:
        "En Vercel la impresión requiere PRINT_SERVER_URL apuntando al portátil del restaurante.",
      simulated: false,
      timestamp,
      status: "error",
    };
  }

  const result = await printTicketText(
    impresora.ip,
    impresora.puerto,
    ticket,
    impresora.anchoPapel,
    true,
  );

  return {
    ok: result.success,
    mode: "network",
    destino: meta.destino,
    tipo: meta.tipo,
    message: result.success
      ? `Impreso en ${impresora.nombre} (${impresora.ip}:${impresora.puerto})`
      : (result.error ?? "Error de impresión"),
    simulated: false,
    timestamp,
    status: result.success ? "printed" : "error",
  };
}

export async function forwardTestPrintToPrintServer(
  impresora: ImpresoraConfig,
  advanced = false,
): Promise<{ success: boolean; error?: string; message: string } | null> {
  const serverUrl = getPrintServerUrl();
  if (!serverUrl) return null;

  try {
    const response = await fetch(
      `${serverUrl.replace(/\/$/, "")}/test-print?advanced=${advanced ? "1" : "0"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ impresora }),
      },
    );
    const data = (await response.json()) as {
      ok: boolean;
      message: string;
    };
    return {
      success: data.ok,
      error: data.ok ? undefined : data.message,
      message: data.ok ? "Impresora conectada" : data.message,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error de red";
    return {
      success: false,
      error: msg,
      message: `No se alcanza el print-server: ${msg}`,
    };
  }
}

export async function testPrinterNetwork(
  impresora: ImpresoraConfig,
  options?: { advanced?: boolean },
): Promise<{ success: boolean; error?: string; message: string }> {
  if (!impresora.ip?.trim()) {
    return {
      success: false,
      error: "IP no configurada",
      message: "Configure la IP de la impresora",
    };
  }

  const advanced = options?.advanced ?? false;
  const viaServer = await forwardTestPrintToPrintServer(impresora, advanced);
  if (viaServer) return viaServer;

  if (isVercelRuntime()) {
    return {
      success: false,
      error: "Sin print-server",
      message:
        "Configure PRINT_SERVER_URL con la IP del portátil del restaurante",
    };
  }

  const result = await testPrinter(impresora.ip, impresora.puerto, advanced);
  return {
    success: result.success,
    error: result.error,
    message: result.success
      ? "Impresora conectada"
      : (result.error ?? "No se pudo conectar"),
  };
}
