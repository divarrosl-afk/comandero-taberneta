import type { EstadoPanel } from "@/types/panel";

export type EstadoPostreX = "sin_postre" | "pendiente" | "marcado";

export interface PostreFormItem {
  id: string;
  nombre: string;
  cantidad: number;
  nota?: string;
}

export interface PostresFormState {
  mesa: number | null;
  camareroId: string | null;
  postres: PostreFormItem[];
  estadoX: EstadoPostreX | null;
  clH: boolean;
  observaciones: string[];
}

export type PostresFormStep = "editar" | "preview" | "enviada";

export interface PostreItem {
  id: string;
  nombre: string;
  cantidad: number;
  nota?: string;
}

export interface ComandaPostres {
  id: string;
  mesa: number;
  camarero: string;
  postres: PostreItem[];
  estadoX: EstadoPostreX | null;
  clH: boolean;
  observaciones: string[];
  creadaEn: string;
  enviada: boolean;
  estadoPanel: EstadoPanel;
}
