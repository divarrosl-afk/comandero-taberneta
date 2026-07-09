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
  /** Etiqueta en ticket de cocina (mayúsculas). */
  labelTicket?: string;
}

/** Modificaciones de un solo toque (activar/desactivar). */
export const MODS_TOGGLE = new Set<ModificacionId>([
  "sin_cebolla",
  "sin_tomate",
  "sin_queso",
  "sin_gluten",
  "sin_lactosa",
  "sin_salsa",
  "poco_hecho",
  "al_punto",
  "muy_hecho",
  "compartir",
  "para_llevar",
  "urgente",
  "ninos",
]);

export const MODIFICACIONES: CatalogoItem<ModificacionId>[] = [
  { id: "champis", label: "Champiñones", labelCorto: "Champis" },
  { id: "mong", label: "Mongetes", labelCorto: "Mong" },
  { id: "fritas", label: "Patatas fritas", labelCorto: "Fritas" },
  { id: "caliu", label: "Patata al caliu", labelCorto: "Caliu" },
  { id: "patatas_bravas", label: "Patatas bravas", labelCorto: "Pat. bravas" },
  { id: "escalibada_15", label: "Escalibada +1,5", labelCorto: "Escalibada +1,5" },
  { id: "huevo", label: "Huevo", labelCorto: "Huevo" },
  { id: "pim_verde", label: "Pimiento verde", labelCorto: "Pim verde" },
  { id: "pim_rojo", label: "Pimiento rojo", labelCorto: "Pim rojo" },
  { id: "alcachofas_2", label: "Alcachofas +2", labelCorto: "Alcachofas+2" },
  { id: "allioli_mod", label: "Allioli", labelCorto: "Allioli" },
  { id: "alubias_mongetes", label: "Alubias (mongetes)", labelCorto: "Mongetes" },
  { id: "cebolla_frita", label: "Cebolla frita", labelCorto: "Cebolla frita" },
  { id: "cebolla_cruda", label: "Cebolla cruda", labelCorto: "Cebolla cruda" },
  { id: "ensalada", label: "Ensalada", labelCorto: "Ensalada" },
  { id: "limon", label: "Limón", labelCorto: "Limón" },
  { id: "plato_vacio", label: "Plato vacío", labelCorto: "Plato vacío" },
  { id: "queso", label: "Queso", labelCorto: "Queso" },
  { id: "servilletas", label: "Servilletas", labelCorto: "Servilletas" },
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
  { id: "salsa_romesco", label: "Salsa romesco", labelCorto: "Romesco" },
  { id: "salsa_roquefort", label: "Salsa roquefort", labelCorto: "Roquefort" },
  { id: "salsa_pimienta", label: "Salsa pimienta", labelCorto: "Pimienta" },
  { id: "salsa_champis", label: "Salsa champis", labelCorto: "Champis" },
];

export const EXTRAS_MESA: CatalogoItem<ExtraMesaId>[] = [
  { id: "cuenta_efectivo", label: "Cuenta efectivo", labelCorto: "Cuenta efectivo" },
  { id: "cuenta_datafono", label: "Cuenta datáfono", labelCorto: "Cuenta datáfono" },
  { id: "vaso_hielo", label: "Vaso con hielo", labelCorto: "Vaso con hielo" },
  { id: "vaso_agua", label: "Vaso agua", labelCorto: "Vaso agua" },
  { id: "vaso_cortado", label: "Vaso cortado", labelCorto: "Vaso cortado" },
  { id: "taza_cafe_solo", label: "Taza café solo", labelCorto: "Taza café solo" },
  { id: "taza_cafe_leche", label: "Taza café con leche", labelCorto: "Taza café c/leche" },
  { id: "vaso_cafe_leche", label: "Vaso café con leche", labelCorto: "Vaso café c/leche" },
  { id: "copa_fria", label: "Copa fría", labelCorto: "Copa fría" },
  { id: "vaso_vermouth", label: "Vaso vermouth", labelCorto: "Vaso vermouth" },
  { id: "copa_grande", label: "Copa grande", labelCorto: "Copa grande" },
  { id: "copa_pequena", label: "Copa pequeña", labelCorto: "Copa pequeña" },
  { id: "vaso_tubo", label: "Vaso tubo", labelCorto: "Vaso tubo" },
  { id: "vaso_tubo_hielo", label: "Vaso tubo + hielo", labelCorto: "Tubo + hielo" },
  { id: "copa_cava", label: "Copa cava", labelCorto: "Copa cava" },
  { id: "enfriador_vino", label: "Enfriador vino", labelCorto: "Enfriador vino" },
  { id: "cubeta_cava", label: "Cubeta cava", labelCorto: "Cubeta cava" },
];

export const TIPOS_PLATO: {
  id: TipoPlatoSeleccion;
  label: string;
  labelCorto: string;
}[] = [
  { id: "menu", label: "MENÚ", labelCorto: "MENÚ" },
  { id: "menu_medio", label: "1/2 MENÚ", labelCorto: "1/2 MENÚ" },
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

export function getModificacionTicketLabel(id: ModificacionId): string {
  const item = MODIFICACIONES.find((m) => m.id === id);
  if (!item) return id.toUpperCase();
  if (item.labelTicket) return item.labelTicket;
  if (item.id.startsWith("sin_")) {
    return item.label.toLocaleUpperCase("es-ES");
  }
  return (item.labelCorto ?? item.label).toLocaleUpperCase("es-ES");
}

export function esModToggle(id: ModificacionId): boolean {
  return MODS_TOGGLE.has(id);
}

export function getSalsaLabel(id: SalsaId): string {
  return SALSAS.find((s) => s.id === id)?.label ?? id;
}

export function getExtraLabel(id: ExtraMesaId): string {
  return EXTRAS_MESA.find((e) => e.id === id)?.label ?? id;
}
