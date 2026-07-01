import type { ImpresoraConfig } from "@/types/impresora";

export type DestinoImpresion = "cocina" | "barra" | "postres";

export type TipoImpresion = "cocina" | "barra" | "postres" | "reimpresion";

export type PrintMode = "mock" | "network";

/** Estado del trabajo en el print-server (cola local). */
export type PrintJobStatus =
  | "queued"
  | "printing"
  | "printed"
  | "error";

export interface PrintTicketRequest {
  ticket: string;
  destino: DestinoImpresion;
  tipo: TipoImpresion;
  comandaId?: string;
  mesa?: string;
  camarero?: string;
  /** Impresora principal — todos los destinos usan la misma físicamente */
  impresora?: ImpresoraConfig;
}

export interface PrintResult {
  ok: boolean;
  mode: PrintMode;
  destino: DestinoImpresion;
  tipo: TipoImpresion;
  message: string;
  simulated: boolean;
  timestamp: string;
  /** ID en print-server (modo red local) */
  jobId?: string;
  status?: PrintJobStatus;
  attempts?: number;
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
  imprimiendo: "Imprimiendo...",
  enCola: "En cola de impresión",
  impreso: "Impreso",
  impresoraInactiva: "Impresora inactiva — ticket no enviado",
  impresoraNoConfigurada: "Configure la impresora en Ajustes",
  sinPrintServer: "Configure el servidor de impresión (URL del portátil)",
} as const;

export const PRINT_STATUS_LABELS: Record<PrintJobStatus, string> = {
  queued: "En cola",
  printing: "Imprimiendo",
  printed: "Impreso",
  error: "Error",
};
