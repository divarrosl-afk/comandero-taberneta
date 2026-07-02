import type { EstadoPostreX, EstadoCafeX } from "@/types/postres";

export const POSTRES_FRECUENTES = [
  "Tarta de queso",
  "Mousse de limón",
  "Tarta tres chocolates",
  "Flan",
  "Crema catalana",
  "Helado",
  "Fruta",
  "Café solo",
  "Cortado",
  "Café con leche",
  "Infusión",
] as const;

export type PostreFrecuente = (typeof POSTRES_FRECUENTES)[number];

export const ESTADOS_X: {
  id: EstadoPostreX;
  label: string;
  labelCorto: string;
}[] = [
  { id: "sin_postre", label: "Sin postre", labelCorto: "Sin postre" },
  { id: "pendiente", label: "Pendiente", labelCorto: "Pendiente" },
  { id: "marcado", label: "Marcado", labelCorto: "Marcado" },
];

export const OBSERVACIONES_POSTRES_RAPIDAS = [
  "Sacar con café",
  "Sin nata",
  "Para compartir",
  "Con helado",
  "Marchar ya",
] as const;

export function getEstadoXLabel(estado: EstadoPostreX): string {
  return ESTADOS_X.find((e) => e.id === estado)?.label ?? estado;
}

export const ESTADO_X_CAFE: { id: EstadoCafeX; label: string }[] = [
  { id: "sin_cafe", label: "Sin café" },
];

export function getEstadoXCafeLabel(estado: EstadoCafeX): string {
  return ESTADO_X_CAFE.find((e) => e.id === estado)?.label ?? estado;
}
