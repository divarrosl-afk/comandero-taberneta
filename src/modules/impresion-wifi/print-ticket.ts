import type {
  PrintResult,
  PrintTicketRequest,
} from "@/modules/impresion-wifi/types";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi/types";
import {
  getEffectivePrintMode,
  getPrintServerUrl,
  resolveImpresoraConfig,
} from "@/modules/impresion-wifi/config";
import { getSupabaseAccessToken } from "@/lib/supabase/client";
import { usesRemoteData } from "@/lib/data/backend";

async function postPrintRequest(
  request: PrintTicketRequest,
  endpoint: string,
): Promise<PrintResult> {
  const impresora = request.impresora ?? resolveImpresoraConfig();
  const mode = getEffectivePrintMode(impresora);
  const timestamp = new Date().toISOString();

  const payload: PrintTicketRequest = { ...request, impresora };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const isAppApi = endpoint.startsWith("/api/");
  if (usesRemoteData() && isAppApi) {
    const token = await getSupabaseAccessToken();
    if (!token) {
      return {
        ok: false,
        mode,
        destino: request.destino,
        tipo: request.tipo,
        message: "Sesión requerida para imprimir — inicia sesión de nuevo",
        simulated: false,
        timestamp,
      };
    }
    headers.Authorization = `Bearer ${token}`;
  } else if (usesRemoteData()) {
    const token = await getSupabaseAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as PrintResult;

    if (!response.ok) {
      return {
        ok: false,
        mode,
        destino: request.destino,
        tipo: request.tipo,
        message: data.message ?? PRINT_MESSAGES.error,
        simulated: mode === "mock",
        timestamp,
      };
    }

    return { ...data, timestamp: data.timestamp ?? timestamp };
  } catch (error) {
    const msg = error instanceof Error ? error.message : PRINT_MESSAGES.error;
    return {
      ok: false,
      mode,
      destino: request.destino,
      tipo: request.tipo,
      message: `${PRINT_MESSAGES.error}: ${msg}`,
      simulated: mode === "mock",
      timestamp,
    };
  }
}

/**
 * Envía un ticket a la impresora principal (todos los destinos comparten hardware).
 * Los móviles nunca imprimen directamente.
 */
export async function printTicket(
  ticket: string,
  destino: PrintTicketRequest["destino"],
  options?: Omit<PrintTicketRequest, "ticket" | "destino">,
): Promise<PrintResult> {
  const impresora = resolveImpresoraConfig(options?.impresora);

  if (!impresora.activa) {
    return {
      ok: true,
      mode: "mock",
      destino,
      tipo: options?.tipo ?? destino,
      message: PRINT_MESSAGES.impresoraInactiva,
      simulated: true,
      timestamp: new Date().toISOString(),
    };
  }

  const request: PrintTicketRequest = {
    ticket,
    destino,
    tipo: options?.tipo ?? destino,
    comandaId: options?.comandaId,
    mesa: options?.mesa,
    camarero: options?.camarero,
    impresora,
  };

  const serverUrl = getPrintServerUrl();
  if (serverUrl) {
    const result = await postPrintRequest(
      request,
      `${serverUrl.replace(/\/$/, "")}/print`,
    );
    if (result.ok) return result;
    const fallback = await postPrintRequest(request, "/api/impresion");
    if (fallback.ok) return fallback;
    return result;
  }

  return postPrintRequest(request, "/api/impresion");
}
