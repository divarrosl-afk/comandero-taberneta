import {
  formatKitchenTicket,
  formatKitchenTicketPlain,
  type TicketFormatOptions,
} from "@/lib/comanda/ticket-kitchen";
import type { ComandaCocina } from "@/types/comanda";

export type { TicketFormatOptions };

export function comandaToTicketCocina(
  comanda: ComandaCocina,
  options?: TicketFormatOptions,
): string {
  return formatKitchenTicket(comanda, "cocina", options);
}

export function comandaToTicketBarra(
  comanda: ComandaCocina,
  options?: TicketFormatOptions,
): string | null {
  const tieneBebidas = comanda.bebidas.length > 0;
  const extrasBarra = comanda.extras.filter((e) =>
    /hielo|limón|limon|pan|cubiertos/i.test(e.nombre),
  );
  const tieneObs = comanda.observaciones.length > 0;

  if (!tieneBebidas && !extrasBarra.length && !tieneObs) return null;

  return formatKitchenTicket(comanda, "barra", options);
}

/** Ticket completo cocina (incluye bebidas) — útil para reimpresión */
export function comandaToTicketCompleto(
  comanda: ComandaCocina,
  options?: TicketFormatOptions,
): string {
  return formatKitchenTicketPlain(comanda, "completo", options);
}
