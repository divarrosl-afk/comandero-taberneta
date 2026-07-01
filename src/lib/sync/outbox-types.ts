import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";
import type { EstadoPanel } from "@/types/panel";

export type OutboxKind =
  | "cocina_create"
  | "postres_create"
  | "cocina_estado"
  | "postres_estado";

export type OutboxPayload =
  | ComandaCocina
  | ComandaPostres
  | { estado: EstadoPanel };

export interface OutboxEntry {
  opId: string;
  kind: OutboxKind;
  entityId: string;
  payload: OutboxPayload;
  createdAt: string;
  retries: number;
}

export interface OperativaSnapshot {
  key: string;
  cocina: ComandaCocina[];
  postres: ComandaPostres[];
  updatedAt: string;
}
