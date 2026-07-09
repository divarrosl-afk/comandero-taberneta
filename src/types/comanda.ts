import type { EstadoPanel } from "@/types/panel";

import type { EstadoCafeX, PostreFormItem } from "@/types/postres";

export type TipoServicio = "menu" | "carta" | "mixto";

export type TipoPlato = "menu" | "menu_medio" | "menu_suplemento" | "carta";

export type TipoPlatoSeleccion =
  | "menu"
  | "menu_medio"
  | "menu_suplemento"
  | "carta"
  | "carta_primero"
  | "carta_segundo";

export type SaleComo = "primero" | "segundo";

export type EstadoPlato = "pendiente" | "marchado" | "servido";

export type SeccionPlatos = "entrantes" | "primeros" | "segundos" | "bebidas";

export type ModificacionId =
  | "champis"
  | "mong"
  | "fritas"
  | "caliu"
  | "escalibada_15"
  | "huevo"
  | "pim_verde"
  | "pim_rojo"
  | "alcachofas_2"
  | "allioli_mod"
  | "alubias_mongetes"
  | "cebolla_frita"
  | "cebolla_cruda"
  | "ensalada"
  | "limon"
  | "patatas_bravas"
  | "plato_vacio"
  | "queso"
  | "salsa_romesco"
  | "salsa_roquefort_mod"
  | "servilletas"
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
  | "cuenta_efectivo"
  | "cuenta_datafono"
  | "vaso_hielo"
  | "vaso_agua"
  | "vaso_cortado"
  | "taza_cafe_solo"
  | "taza_cafe_leche"
  | "vaso_cafe_leche"
  | "copa_fria"
  | "vaso_vermouth"
  | "copa_grande"
  | "copa_pequena"
  | "vaso_tubo"
  | "vaso_tubo_hielo"
  | "copa_cava"
  | "enfriador_vino"
  | "cubeta_cava";

export interface SalsaCantidad {
  id: string;
  nombre: string;
  cantidad: 1 | 2 | 3;
}

export interface ExtraMesaItem {
  id: string;
  nombre: string;
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
  mesa: string;
  /** Código de mesa (C1, R2…) para mostrar cuando mesa es UUID. */
  mesaCodigo?: string;
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
  mesa: string | null;
  camareroId: string | null;
  entrantes: PlatoFormItem[];
  primeros: PlatoFormItem[];
  segundos: PlatoFormItem[];
  bebidas: PlatoFormItem[];
  postres: PostreFormItem[];
  cafes: PostreFormItem[];
  estadoXCafe: EstadoCafeX | null;
  extras: ExtraMesaItem[];
  observaciones: string[];
}

export type ComandaFormStep = "editar" | "preview" | "enviada";
