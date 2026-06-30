import type { PrintTicketRequest } from "@/modules/impresion-wifi/types";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi/types";

/**
 * Driver mock — registra el ticket en la impresora principal (simulado).
 */
export function printMock(request: PrintTicketRequest) {
  const timestamp = new Date().toISOString();
  const imp = request.impresora;
  const printerLabel = imp?.nombre ?? "Impresora principal";

  console.info(
    `[MOCK PRINT] ${printerLabel} · ${request.destino} · ${request.tipo}`,
    {
      ip: imp?.ip || "—",
      puerto: imp?.puerto ?? 9100,
      ancho: imp?.anchoPapel ?? "80mm",
      mesa: request.mesa,
    },
  );
  console.info(request.ticket);

  return {
    ok: true,
    mode: "mock" as const,
    destino: request.destino,
    tipo: request.tipo,
    message: `${PRINT_MESSAGES.ticketSimulado} → ${printerLabel}`,
    simulated: true,
    timestamp,
  };
}
