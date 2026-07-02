/** Estados del semáforo de marcha en panel cocina/barra */
export type EstadoPanel =
  | "sentados"
  | "bebidas"
  | "tapas"
  | "marcha_1"
  | "tiene_primeros"
  | "marcha_segundos"
  | "segundos"
  | "marcha_postres"
  | "tiene_postres"
  | "marcha_cafes"
  | "tiene_cafes"
  | "marcha_cuenta"
  | "mesa_libre";

/** Valores antiguos guardados en BD local o remota */
const LEGACY_ESTADO_PANEL: Record<string, EstadoPanel> = {
  pendiente: "sentados",
  en_preparacion: "bebidas",
  listo: "tiene_primeros",
  servido: "marcha_segundos",
};

export const ESTADOS_PANEL: {
  id: EstadoPanel;
  label: string;
  labelCorto: string;
  color: string;
}[] = [
  {
    id: "sentados",
    label: "Sentados",
    labelCorto: "Sent.",
    color: "bg-amber-100 text-amber-900 border-amber-400",
  },
  {
    id: "bebidas",
    label: "Tiene bebidas",
    labelCorto: "Bebidas",
    color: "bg-sky-100 text-sky-900 border-sky-400",
  },
  {
    id: "tapas",
    label: "Tapas",
    labelCorto: "Tapas",
    color: "bg-orange-100 text-orange-900 border-orange-400",
  },
  {
    id: "marcha_1",
    label: "Marcha 1",
    labelCorto: "M.1",
    color: "bg-yellow-100 text-yellow-900 border-yellow-500",
  },
  {
    id: "tiene_primeros",
    label: "Tiene primeros",
    labelCorto: "1º",
    color: "bg-lime-100 text-lime-900 border-lime-500",
  },
  {
    id: "marcha_segundos",
    label: "Marcha segundos",
    labelCorto: "M.Seg",
    color: "bg-red-100 text-red-900 border-red-500",
  },
  {
    id: "segundos",
    label: "Segundos",
    labelCorto: "2º",
    color: "bg-rose-100 text-rose-900 border-rose-500",
  },
  {
    id: "marcha_postres",
    label: "Marcha postres",
    labelCorto: "M.Post",
    color: "bg-purple-100 text-purple-900 border-purple-500",
  },
  {
    id: "tiene_postres",
    label: "Tiene postres",
    labelCorto: "Post",
    color: "bg-violet-100 text-violet-900 border-violet-500",
  },
  {
    id: "marcha_cafes",
    label: "Marcha cafés",
    labelCorto: "M.Café",
    color: "bg-amber-50 text-amber-800 border-amber-500",
  },
  {
    id: "tiene_cafes",
    label: "Tiene cafés",
    labelCorto: "Café",
    color: "bg-yellow-50 text-yellow-900 border-yellow-600",
  },
  {
    id: "marcha_cuenta",
    label: "Marcha cuenta",
    labelCorto: "Cuenta",
    color: "bg-stone-200 text-stone-800 border-stone-500",
  },
  {
    id: "mesa_libre",
    label: "Mesa libre",
    labelCorto: "Libre",
    color: "bg-stone-100 text-stone-500 border-stone-300",
  },
];

const ESTADOS_PANEL_SET = new Set<string>(ESTADOS_PANEL.map((e) => e.id));

export function normalizeEstadoPanel(raw?: string | null): EstadoPanel {
  if (!raw) return "sentados";
  if (ESTADOS_PANEL_SET.has(raw)) return raw as EstadoPanel;
  return LEGACY_ESTADO_PANEL[raw] ?? "sentados";
}

/** Comanda visible en panel activo */
export function isEstadoPanelActivo(estado: EstadoPanel): boolean {
  return estado !== "mesa_libre";
}

/** Comanda terminada (cuenta o mesa libre) */
export function isEstadoPanelTerminal(estado: EstadoPanel): boolean {
  return estado === "mesa_libre" || estado === "marcha_cuenta";
}

export function indiceEstadoPanel(estado: EstadoPanel): number {
  return ESTADOS_PANEL.findIndex((e) => e.id === estado);
}

export function getEstadoPanelLabel(estado: EstadoPanel): string {
  return ESTADOS_PANEL.find((e) => e.id === estado)?.label ?? estado;
}

export function getEstadoPanelStyle(estado: EstadoPanel): string {
  return (
    ESTADOS_PANEL.find((e) => e.id === estado)?.color ??
    "bg-stone-100 text-stone-700 border-stone-300"
  );
}

export type HistorialTipo = "cocina" | "postres";

export interface HistorialItem {
  id: string;
  tipo: HistorialTipo;
  mesa: string;
  camarero: string;
  creadaEn: string;
  estadoPanel: EstadoPanel;
}
