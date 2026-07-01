export type {
  DestinoImpresion,
  PrintBatchResult,
  PrintMode,
  PrintResult,
  PrintTicketRequest,
  TipoImpresion,
} from "@/modules/impresion-wifi/types";
export { PRINT_MESSAGES } from "@/modules/impresion-wifi/types";
export { printTicket } from "@/modules/impresion-wifi/print-ticket";
export {
  imprimirComandaCocina,
  imprimirComandaPostres,
  reimprimirTicket,
  destinoDesdeHistorial,
} from "@/modules/impresion-wifi/imprimir-comanda";
