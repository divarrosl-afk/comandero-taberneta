import {
  printTicketText,
  testPrinter,
} from "@/lib/impresion/escpos-network";
import { enqueueCloudPrintJob } from "@/lib/print/print-jobs-repository";
import type { ImpresoraConfig } from "@/types/impresora";
import type { PrintTicketRequest, PrintResult } from "@/modules/impresion-wifi/types";

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

function getServerPrintServerUrl(): string | null {
  const url =
    process.env.PRINT_SERVER_URL?.trim() ||
    process.env.NEXT_PUBLIC_PRINT_SERVER_URL?.trim();
  return url || null;
}

function isReachableFromServer(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return true;
    if (/^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname)) {
      return !isVercelRuntime();
    }
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

async function enqueueCloudPrint(
  request: PrintTicketRequest,
): Promise<PrintResult> {
  const timestamp = new Date().toISOString();
  const job = await enqueueCloudPrintJob(request);

  if (!job) {
    return {
      ok: false,
      mode: "network",
      destino: request.destino,
      tipo: request.tipo,
      message:
        "No se pudo encolar el ticket — compruebe Supabase y la migración print_jobs.",
      simulated: false,
      timestamp,
      status: "error",
    };
  }

  return {
    ok: true,
    mode: "network",
    destino: request.destino,
    tipo: request.tipo,
    message: "Ticket encolado — el print-server del restaurante lo imprimirá en breve.",
    simulated: false,
    timestamp,
    status: "queued",
    jobId: job.id,
  };
}

export async function forwardToPrintServer(
  request: PrintTicketRequest,
): Promise<PrintResult | null> {
  const serverUrl = getServerPrintServerUrl();
  if (!serverUrl || !isReachableFromServer(serverUrl)) return null;

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
  const serverUrl = getServerPrintServerUrl();
  if (!serverUrl || !isReachableFromServer(serverUrl)) return null;

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
  meta: PrintTicketRequest,
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
    ...meta,
    ticket,
    impresora,
  };

  const forwarded = await forwardToPrintServer(request);
  if (forwarded?.ok) {
    return { ...forwarded, simulated: false, mode: "network" };
  }

  if (isVercelRuntime()) {
    return enqueueCloudPrint(request);
  }

  const result = await printTicketText(
    impresora.ip,
    impresora.puerto,
    ticket,
    impresora.anchoPapel,
    true,
  );

  if (!result.success) {
    const cloud = await enqueueCloudPrint(request);
    if (cloud.ok) return cloud;
  }

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
  const serverUrl = getServerPrintServerUrl();
  if (!serverUrl || !isReachableFromServer(serverUrl)) return null;

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
      success: true,
      message:
        "Modo nube: la prueba de impresión se hará cuando el print-server recoja el ticket encolado.",
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
