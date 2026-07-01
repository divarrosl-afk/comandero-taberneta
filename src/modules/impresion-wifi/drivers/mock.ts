import type { PrintTicketRequest, PrintResult } from "@/modules/impresion-wifi/types";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi/types";

/**
 * Driver mock — registra el ticket sin enviar a impresora física.
 */
export function printMock(request: PrintTicketRequest): PrintResult {
  const timestamp = new Date().toISOString();
  const header = `[MOCK PRINT] ${request.destino.toUpperCase()} · ${request.tipo}`;

  console.info(header, {
    mesa: request.mesa,
    camarero: request.camarero,
    comandaId: request.comandaId,
    lines: request.ticket.split("\n").length,
  });
  console.info(request.ticket);

  return {
    ok: true,
    mode: "mock",
    destino: request.destino,
    tipo: request.tipo,
    message: `${PRINT_MESSAGES.ticketSimulado} → ${request.destino}`,
    simulated: true,
    timestamp,
  };
}
