import type { HistorialEntrada } from "@/lib/historial/items";
import { getCodigoMesaComanda } from "@/lib/mesas/resolve-mesa";
import { comandaPostresToTexto } from "@/lib/postres/format-ticket";
import { comandaToTicketImpresion } from "@/modules/impresion-wifi/format-tickets";
import { printTicket } from "@/modules/impresion-wifi/print-ticket";
import type { PrintBatchResult } from "@/modules/impresion-wifi/types";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi/types";
import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";

const COPIAS_TICKET_COMPLETO = 2;

function ticketOptionsForComanda(comanda: {
  mesa: string;
  mesaCodigo?: string;
  comensales?: number;
}) {
  return {
    nombreMesa: getCodigoMesaComanda(comanda),
    comensales: comanda.comensales,
  };
}

function buildSummary(results: Awaited<ReturnType<typeof printTicket>>[]): string {
  if (results.every((r) => r.ok)) {
    const simulated = results.some((r) => r.simulated);
    if (simulated) {
      return `${PRINT_MESSAGES.enviada} · ${PRINT_MESSAGES.ticketSimulado}`;
    }
    const queued = results.some((r) => r.status === "queued");
    if (queued) {
      return `${PRINT_MESSAGES.enviada} · ${PRINT_MESSAGES.enCola}`;
    }
    const printed = results.every(
      (r) => r.status === "printed" || r.status === "queued" || !r.status,
    );
    return printed
      ? `${PRINT_MESSAGES.enviada} · ${PRINT_MESSAGES.impreso} (2 copias)`
      : PRINT_MESSAGES.enviada;
  }
  const failed = results.find((r) => !r.ok);
  const failedCount = results.filter((r) => !r.ok).length;
  const detail = failed?.message?.trim();
  const base = `${PRINT_MESSAGES.error} (${failedCount}/${results.length} copias)`;
  return detail && detail !== PRINT_MESSAGES.error ? `${base} — ${detail}` : base;
}

export async function imprimirComandaCocina(
  comanda: ComandaCocina,
): Promise<PrintBatchResult> {
  const ticketOptions = ticketOptionsForComanda(comanda);
  const ticket = comandaToTicketImpresion(comanda, ticketOptions);
  const meta = {
    tipo: "cocina" as const,
    comandaId: comanda.id,
    mesa: comanda.mesa,
    camarero: comanda.camarero,
  };

  const results: Awaited<ReturnType<typeof printTicket>>[] = [];
  for (let copia = 0; copia < COPIAS_TICKET_COMPLETO; copia++) {
    const result = await printTicket(ticket, "cocina", meta);
    results.push(result);
    if (!result.ok) break;
  }

  return {
    results,
    allOk: results.every((r) => r.ok),
    summary: buildSummary(results),
  };
}

export async function imprimirComandaPostres(
  comanda: ComandaPostres,
): Promise<PrintBatchResult> {
  const ticketOptions = ticketOptionsForComanda(comanda);
  const results = [
    await printTicket(comandaPostresToTexto(comanda, ticketOptions), "postres", {
      tipo: "postres",
      comandaId: comanda.id,
      mesa: comanda.mesa,
      camarero: comanda.camarero,
    }),
  ];

  return {
    results,
    allOk: results.every((r) => r.ok),
    summary: buildSummary(results),
  };
}

/** Reimprime 1 copia desde panel o historial. */
export async function reimprimirComandaCocina(
  comanda: ComandaCocina,
): Promise<PrintBatchResult> {
  const ticketOptions = ticketOptionsForComanda(comanda);
  const ticket = comandaToTicketImpresion(comanda, ticketOptions);
  return reimprimirTicket(ticket, "cocina", {
    comandaId: comanda.id,
    mesa: comanda.mesa,
    camarero: comanda.camarero,
  });
}

export async function reimprimirComandaPostres(
  comanda: ComandaPostres,
): Promise<PrintBatchResult> {
  const ticketOptions = ticketOptionsForComanda(comanda);
  return reimprimirTicket(
    comandaPostresToTexto(comanda, ticketOptions),
    "postres",
    {
      comandaId: comanda.id,
      mesa: comanda.mesa,
      camarero: comanda.camarero,
    },
  );
}

/** Reimprime 2 copias del ticket completo (cocina + barra). */
export async function reimprimirEntrada(
  entrada: HistorialEntrada,
): Promise<PrintBatchResult> {
  if (entrada.tipo === "cocina") {
    return reimprimirComandaCocina(entrada.comanda);
  }
  return reimprimirComandaPostres(entrada.comanda);
}

export async function reimprimirTicket(
  ticket: string,
  destino: "cocina" | "barra" | "postres",
  meta?: { comandaId?: string; mesa?: string; camarero?: string },
): Promise<PrintBatchResult> {
  const result = await printTicket(ticket, destino, {
    tipo: "reimpresion",
    ...meta,
  });

  return {
    results: [result],
    allOk: result.ok,
    summary: result.ok
      ? result.simulated
        ? `${PRINT_MESSAGES.ticketSimulado} · ${destino}`
        : result.status === "queued"
          ? `${PRINT_MESSAGES.enCola} · ${destino}`
          : `Reimpreso · ${destino}`
      : result.message?.trim() || PRINT_MESSAGES.error,
  };
}

export function destinoDesdeHistorial(
  tipo: "cocina" | "postres",
): "cocina" | "postres" {
  return tipo === "postres" ? "postres" : "cocina";
}
