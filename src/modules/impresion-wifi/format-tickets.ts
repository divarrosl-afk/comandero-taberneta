import {
  formatKitchenTicket,
  formatKitchenTicketPlain,
  type TicketFormatOptions,
} from "@/lib/comanda/ticket-kitchen";
import type { ComandaCocina } from "@/types/comanda";

export type { TicketFormatOptions };

/** Ticket completo con marcadores ESC/POS — impresión (2 copias idénticas). */
export function comandaToTicketImpresion(
  comanda: ComandaCocina,
  options?: TicketFormatOptions,
): string {
  return formatKitchenTicket(comanda, "completo", options);
}

/** Vista previa / texto plano sin marcadores de impresora. */
export function comandaToTicketCompleto(
  comanda: ComandaCocina,
  options?: TicketFormatOptions,
): string {
  return formatKitchenTicketPlain(comanda, "completo", options);
}

/** @deprecated Usar comandaToTicketImpresion — mismo ticket completo */
export function comandaToTicketCocina(
  comanda: ComandaCocina,
  options?: TicketFormatOptions,
): string {
  return comandaToTicketImpresion(comanda, options);
}

/** @deprecated Ticket barra reducido eliminado — usar comandaToTicketImpresion */
export function comandaToTicketBarra(
  _comanda: ComandaCocina,
  _options?: TicketFormatOptions,
): string | null {
  return null;
}
