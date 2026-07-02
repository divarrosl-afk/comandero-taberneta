import type { EstadoPanel } from "@/types/panel";

export type EstadoPostreX = "sin_postre" | "pendiente" | "marcado";

/** X en sección cafés del ticket */
export type EstadoCafeX = "sin_cafe";

export interface PostreFormItem {
  id: string;
  nombre: string;
  cantidad: number;
  nota?: string;
}

export interface PostresFormState {
  mesa: string | null;
  camareroId: string | null;
  postres: PostreFormItem[];
  cafes: PostreFormItem[];
  estadoX: EstadoPostreX | null;
  estadoXCafe: EstadoCafeX | null;
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
  mesa: string;
  mesaCodigo?: string;
  camarero: string;
  postres: PostreItem[];
  cafes: PostreItem[];
  estadoX: EstadoPostreX | null;
  estadoXCafe: EstadoCafeX | null;
  clH: boolean;
  observaciones: string[];
  creadaEn: string;
  enviada: boolean;
  estadoPanel: EstadoPanel;
}
