import {
  formatKitchenTicketPlain,
  type TicketFormatOptions,
} from "@/lib/comanda/ticket-kitchen";
import type { ComandaCocina } from "@/types/comanda";

export function comandaToTexto(
  comanda: ComandaCocina,
  options?: TicketFormatOptions,
): string {
  return formatKitchenTicketPlain(comanda, "completo", options);
}
