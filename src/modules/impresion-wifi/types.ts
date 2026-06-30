import type { ImpresoraConfig } from "@/types/impresora";

export type DestinoImpresion = "cocina" | "barra" | "postres";

export type TipoImpresion = "cocina" | "barra" | "postres" | "reimpresion";

export type PrintMode = "mock" | "network";

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
  impresoraInactiva: "Impresora inactiva — ticket no enviado",
  impresoraNoConfigurada: "Configure la impresora en Ajustes",
} as const;
