export type DestinoImpresion = "cocina" | "barra" | "postres";

export type TipoImpresion = "cocina" | "barra" | "postres" | "reimpresion";

export type PrintMode = "mock" | "network";

export interface PrintTicketRequest {
  ticket: string;
  destino: DestinoImpresion;
  tipo: TipoImpresion;
  comandaId?: string;
  mesa?: number;
  camarero?: string;
}

export interface PrintResult {
  ok: boolean;
  mode: PrintMode;
  destino: DestinoImpresion;
  tipo: TipoImpresion;
  message: string;
  simulated: boolean;
  timestamp: string;
}

export interface PrintBatchResult {
  results: PrintResult[];
  allOk: boolean;
  summary: string;
}

export const PRINT_MESSAGES = {
  enviada: "Comanda enviada",
  ticketSimulado: "Ticket simulado",
  error: "Error de impresión",
  enviando: "Enviando a impresora...",
} as const;
