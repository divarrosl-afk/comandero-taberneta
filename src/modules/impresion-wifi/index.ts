export type {
  DestinoImpresion,
  PrintBatchResult,
  PrintJobStatus,
  PrintMode,
  PrintResult,
  PrintTicketRequest,
  TipoImpresion,
} from "@/modules/impresion-wifi/types";
export { PRINT_MESSAGES, PRINT_STATUS_LABELS } from "@/modules/impresion-wifi/types";
export { printTicket, printStatusLabel } from "@/modules/impresion-wifi/print-ticket";
export {
  imprimirComandaCocina,
  imprimirComandaPostres,
  reimprimirTicket,
  destinoDesdeHistorial,
} from "@/modules/impresion-wifi/imprimir-comanda";
export { probarImpresora, probarConexionImpresora } from "@/modules/impresion-wifi/probar-impresora";
