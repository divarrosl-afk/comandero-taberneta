import type { HistorialEntrada } from "@/lib/historial/items";
import { getNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import { comandaPostresToTexto } from "@/lib/postres/format-ticket";
import {
  comandaToTicketBarra,
  comandaToTicketCocina,
} from "@/modules/impresion-wifi/format-tickets";
import { printTicket } from "@/modules/impresion-wifi/print-ticket";
import type { PrintBatchResult } from "@/modules/impresion-wifi/types";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi/types";
import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";

function ticketOptionsForComanda(comanda: { mesa: string; mesaCodigo?: string }) {
  return { nombreMesa: getNombreMesaComanda(comanda) };
}

function buildSummary(results: Awaited<ReturnType<typeof printTicket>>[]): string {
  if (results.every((r) => r.ok)) {
    const simulated = results.some((r) => r.simulated);
    if (simulated) {
      return `${PRINT_MESSAGES.enviada} · ${PRINT_MESSAGES.ticketSimulado}`;
    }
    const printed = results.every((r) => r.status === "printed" || !r.status);
    return printed
      ? `${PRINT_MESSAGES.enviada} · ${PRINT_MESSAGES.impreso}`
      : PRINT_MESSAGES.enviada;
  }
  const failed = results.filter((r) => !r.ok).map((r) => r.destino);
  return `${PRINT_MESSAGES.error} (${failed.join(", ")})`;
}

export async function imprimirComandaCocina(
  comanda: ComandaCocina,
): Promise<PrintBatchResult> {
  const ticketOptions = ticketOptionsForComanda(comanda);

  const jobs = [
    printTicket(comandaToTicketCocina(comanda, ticketOptions), "cocina", {
      tipo: "cocina",
      comandaId: comanda.id,
      mesa: comanda.mesa,
      camarero: comanda.camarero,
    }),
  ];

  const ticketBarra = comandaToTicketBarra(comanda, ticketOptions);
  if (ticketBarra) {
    jobs.push(
      printTicket(ticketBarra, "barra", {
        tipo: "barra",
        comandaId: comanda.id,
        mesa: comanda.mesa,
        camarero: comanda.camarero,
      }),
    );
  }

  const results = await Promise.all(jobs);
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

/** Reimprime cocina+barra o postres regenerando el ticket (mismo formato que envío). */
export async function reimprimirEntrada(
  entrada: HistorialEntrada,
): Promise<PrintBatchResult> {
  if (entrada.tipo === "cocina") {
    return imprimirComandaCocina(entrada.comanda);
  }
  return imprimirComandaPostres(entrada.comanda);
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
        : `Reimpreso · ${destino}`
      : PRINT_MESSAGES.error,
  };
}

export function destinoDesdeHistorial(
  tipo: "cocina" | "postres",
): "cocina" | "postres" {
  return tipo === "postres" ? "postres" : "cocina";
}
