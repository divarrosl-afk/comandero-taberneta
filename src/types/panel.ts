export type EstadoPanel =
  | "pendiente"
  | "en_preparacion"
  | "listo"
  | "servido";

export const ESTADOS_PANEL: {
  id: EstadoPanel;
  label: string;
  labelCorto: string;
  color: string;
}[] = [
  {
    id: "pendiente",
    label: "Pendiente",
    labelCorto: "Pend.",
    color: "bg-amber-100 text-amber-800 border-amber-300",
  },
  {
    id: "en_preparacion",
    label: "En preparación",
    labelCorto: "Prep.",
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  {
    id: "listo",
    label: "Listo",
    labelCorto: "Listo",
    color: "bg-green-100 text-green-800 border-green-300",
  },
  {
    id: "servido",
    label: "Servido",
    labelCorto: "Serv.",
    color: "bg-stone-200 text-stone-600 border-stone-300",
  },
];

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
  mesa: number;
  camarero: string;
  creadaEn: string;
  estadoPanel: EstadoPanel;
}
