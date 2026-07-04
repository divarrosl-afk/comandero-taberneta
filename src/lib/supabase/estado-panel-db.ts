import type { EstadoPanel } from "@/types/panel";
import { normalizeEstadoPanel } from "@/types/panel";

/** Enum legacy en Postgres antes de migración 20250705_estado_panel_semaforo.sql */
export type DbEstadoPanelLegacy =
  | "pendiente"
  | "en_preparacion"
  | "listo"
  | "servido";

const APP_TO_LEGACY_DB: Record<EstadoPanel, DbEstadoPanelLegacy> = {
  sentados: "pendiente",
  bebidas: "en_preparacion",
  tapas: "en_preparacion",
  marcha_1: "en_preparacion",
  tiene_primeros: "listo",
  marcha_segundos: "servido",
  segundos: "servido",
  marcha_postres: "servido",
  tiene_postres: "servido",
  marcha_cafes: "servido",
  tiene_cafes: "servido",
  marcha_cuenta: "servido",
  mesa_libre: "servido",
};

export function estadoPanelToLegacyDbEnum(
  estado: EstadoPanel | string,
): DbEstadoPanelLegacy {
  return APP_TO_LEGACY_DB[normalizeEstadoPanel(estado)];
}

export function isInvalidEstadoPanelEnumError(message: string): boolean {
  return (
    /ct_estado_panel/i.test(message) &&
    /invalid input value/i.test(message)
  );
}
