import type {
  PrintResult,
  PrintTicketRequest,
} from "@/modules/impresion-wifi/types";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi/types";
import { getPrintMode, getPrintServerUrl } from "@/modules/impresion-wifi/config";

async function postPrintRequest(
  request: PrintTicketRequest,
  endpoint: string,
): Promise<PrintResult> {
  const mode = getPrintMode();
  const timestamp = new Date().toISOString();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
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
 * Envía un ticket al servidor local de impresión (o API interna en modo mock).
 * Los móviles nunca imprimen directamente.
 */
export async function printTicket(
  ticket: string,
  destino: PrintTicketRequest["destino"],
  options?: Omit<PrintTicketRequest, "ticket" | "destino">,
): Promise<PrintResult> {
  const request: PrintTicketRequest = {
    ticket,
    destino,
    tipo: options?.tipo ?? destino,
    comandaId: options?.comandaId,
    mesa: options?.mesa,
    camarero: options?.camarero,
  };

  const serverUrl = getPrintServerUrl();
  if (serverUrl) {
    const result = await postPrintRequest(
      request,
      `${serverUrl.replace(/\/$/, "")}/print`,
    );
    if (result.ok) return result;
    // Fallback a API interna si el servidor local no responde
    const fallback = await postPrintRequest(request, "/api/impresion");
    if (fallback.ok) return fallback;
    return result;
  }

  return postPrintRequest(request, "/api/impresion");
}
