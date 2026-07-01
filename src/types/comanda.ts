export type TipoServicio = "menu" | "carta" | "mixto";

export type TipoPlato = "menu" | "menu_suplemento" | "carta";

export type TipoPlatoSeleccion =
  | "menu"
  | "menu_suplemento"
  | "carta"
  | "carta_primero"
  | "carta_segundo";

export type SaleComo = "primero" | "segundo";

export type EstadoPlato = "pendiente" | "marchado" | "servido";

export type SeccionComanda =
  | "entrantes"
  | "primeros"
  | "segundos"
  | "bebidas"
  | "observaciones";

export interface PlatoComanda {
  id: string;
  nombre: string;
  cantidad: number;
  tipo?: TipoPlato;
  saleComo?: SaleComo;
  suplemento?: number;
  notasCocina?: string;
  estado: EstadoPlato;
}

export interface ComandaCocina {
  id: string;
  mesa: number;
  camarero: string;
  tipoServicio: TipoServicio;
  entrantes: PlatoComanda[];
  primeros: PlatoComanda[];
  segundos: PlatoComanda[];
  bebidas: PlatoComanda[];
  observaciones: string[];
  creadaEn: string;
  enviada: boolean;
}

export type EstadoPostre = "sin_postre" | "pendiente" | "marcado";

export interface ComandaPostres {
  id: string;
  mesa: number;
  postres: string[];
  estadoX: EstadoPostre;
  clH: string;
  observaciones: string;
  creadaEn: string;
  enviada: boolean;
}

export interface Camarero {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface PlatoFormItem {
  id: string;
  nombre: string;
  cantidad: number;
  tipoSeleccion?: TipoPlatoSeleccion;
  suplemento?: number;
  notasCocina?: string;
}

export interface ComandaFormState {
  mesa: number | null;
  camareroId: string | null;
  entrantes: PlatoFormItem[];
  primeros: PlatoFormItem[];
  segundos: PlatoFormItem[];
  bebidas: PlatoFormItem[];
  observaciones: string[];
}

export type ComandaFormStep = "editar" | "preview" | "enviada";
