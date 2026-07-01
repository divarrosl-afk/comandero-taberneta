import type {
  ExtraMesaId,
  ModificacionId,
  SalsaId,
  TipoPlatoSeleccion,
} from "@/types/comanda";

export interface CatalogoItem<T extends string> {
  id: T;
  label: string;
  labelCorto?: string;
}

export const MODIFICACIONES: CatalogoItem<ModificacionId>[] = [
  { id: "sin_cebolla", label: "Sin cebolla", labelCorto: "S/cebolla" },
  { id: "sin_tomate", label: "Sin tomate", labelCorto: "S/tomate" },
  { id: "sin_queso", label: "Sin queso", labelCorto: "S/queso" },
  { id: "sin_gluten", label: "Sin gluten", labelCorto: "S/gluten" },
  { id: "sin_lactosa", label: "Sin lactosa", labelCorto: "S/lactosa" },
  { id: "sin_salsa", label: "Sin salsa", labelCorto: "S/salsa" },
  { id: "poco_hecho", label: "Poco hecho", labelCorto: "Poco hecho" },
  { id: "al_punto", label: "Al punto", labelCorto: "Al punto" },
  { id: "muy_hecho", label: "Muy hecho", labelCorto: "Muy hecho" },
  { id: "compartir", label: "Compartir", labelCorto: "Compartir" },
  { id: "para_llevar", label: "Para llevar", labelCorto: "P/llevar" },
  { id: "urgente", label: "Urgente", labelCorto: "URGENTE" },
  { id: "ninos", label: "Niños", labelCorto: "Niños" },
];

export const SALSAS: CatalogoItem<SalsaId>[] = [
  { id: "alioli", label: "Alioli" },
  { id: "mayonesa", label: "Mayonesa", labelCorto: "Mayo" },
  { id: "ketchup", label: "Ketchup" },
  { id: "salsa_brava", label: "Salsa brava", labelCorto: "Brava" },
  { id: "salsa_pimienta", label: "Salsa pimienta", labelCorto: "Pimienta" },
  { id: "salsa_roquefort", label: "Salsa roquefort", labelCorto: "Roquefort" },
];

export const EXTRAS_MESA: CatalogoItem<ExtraMesaId>[] = [
  { id: "pan", label: "Pan" },
  { id: "pan_sin_gluten", label: "Pan sin gluten", labelCorto: "Pan s/gluten" },
  { id: "cubiertos", label: "Cubiertos" },
  { id: "plato_vacio", label: "Plato vacío", labelCorto: "Plato vacío" },
  { id: "servilletas", label: "Servilletas" },
  { id: "hielo", label: "Hielo" },
  { id: "limon", label: "Limón" },
];

export const TIPOS_PLATO: {
  id: TipoPlatoSeleccion;
  label: string;
  labelCorto: string;
}[] = [
  { id: "menu", label: "MENÚ", labelCorto: "MENÚ" },
  { id: "menu_suplemento", label: "MENÚ + SUPLEMENTO", labelCorto: "MENÚ+SUP" },
  { id: "carta", label: "CARTA", labelCorto: "CARTA" },
  { id: "carta_primero", label: "CARTA → SALE COMO PRIMERO", labelCorto: "CARTA→1º" },
  { id: "carta_segundo", label: "CARTA → SALE COMO SEGUNDO", labelCorto: "CARTA→2º" },
];

export const SUPLEMENTOS_RAPIDOS = [3, 5, 7, 10] as const;

export const OBSERVACIONES_RAPIDAS = [
  "Primero sacar entrantes",
  "Marchar segundos después",
  "Todo junto",
  "Con prisa",
  "Mesa alergias",
] as const;

export function getModificacionLabel(id: ModificacionId): string {
  return MODIFICACIONES.find((m) => m.id === id)?.label ?? id;
}

export function getSalsaLabel(id: SalsaId): string {
  return SALSAS.find((s) => s.id === id)?.label ?? id;
}

export function getExtraLabel(id: ExtraMesaId): string {
  return EXTRAS_MESA.find((e) => e.id === id)?.label ?? id;
}
