import type { EstadoPanel } from "@/types/panel";

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

export type SeccionPlatos = "entrantes" | "primeros" | "segundos" | "bebidas";

export type ModificacionId =
  | "sin_cebolla"
  | "sin_tomate"
  | "sin_queso"
  | "sin_gluten"
  | "sin_lactosa"
  | "sin_salsa"
  | "poco_hecho"
  | "al_punto"
  | "muy_hecho"
  | "compartir"
  | "para_llevar"
  | "urgente"
  | "ninos";

export type SalsaId =
  | "alioli"
  | "mayonesa"
  | "ketchup"
  | "salsa_brava"
  | "salsa_pimienta"
  | "salsa_roquefort";

export type ExtraMesaId =
  | "pan"
  | "pan_sin_gluten"
  | "cubiertos"
  | "plato_vacio"
  | "servilletas"
  | "hielo"
  | "limon";

export interface SalsaCantidad {
  id: SalsaId;
  cantidad: 1 | 2 | 3;
}

export interface ExtraMesaItem {
  id: ExtraMesaId;
  cantidad: number;
}

export interface PlatoComanda {
  id: string;
  nombre: string;
  cantidad: number;
  tipo?: TipoPlato;
  saleComo?: SaleComo;
  suplemento?: number;
  modificaciones: string[];
  salsas: { nombre: string; cantidad: number }[];
  notaLibre?: string;
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
  extras: { nombre: string; cantidad: number }[];
  observaciones: string[];
  creadaEn: string;
  enviada: boolean;
  estadoPanel: EstadoPanel;
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
  modificaciones: ModificacionId[];
  salsas: SalsaCantidad[];
  notaLibre?: string;
}

export interface ComandaFormState {
  mesa: number | null;
  camareroId: string | null;
  entrantes: PlatoFormItem[];
  primeros: PlatoFormItem[];
  segundos: PlatoFormItem[];
  bebidas: PlatoFormItem[];
  extras: ExtraMesaItem[];
  observaciones: string[];
}

export type ComandaFormStep = "editar" | "preview" | "enviada";
