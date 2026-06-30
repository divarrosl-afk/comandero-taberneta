import type { EstadoPanel, HistorialTipo } from "@/types/panel";

export type FiltroTipoCierre = "todos" | HistorialTipo;

export type FiltroEstadoCierre = "todos" | EstadoPanel;

export interface FiltrosCierre {
  fecha: string;
  camarero: string;
  mesa: number | null;
  tipo: FiltroTipoCierre;
  estado: FiltroEstadoCierre;
}

export interface ConteoItem {
  nombre: string;
  cantidad: number;
}

export interface ConteoCamarero {
  camarero: string;
  cantidad: number;
}

export interface ConteoMesa {
  mesa: number;
  cantidad: number;
}

export interface ResumenCierre {
  totalCocina: number;
  totalPostres: number;
  totalTickets: number;
  porCamarero: ConteoCamarero[];
  porMesa: ConteoMesa[];
  platosMasPedidos: ConteoItem[];
  bebidasMasPedidas: ConteoItem[];
  postresMasPedidos: ConteoItem[];
  porEstado: Record<EstadoPanel, number>;
}

export interface EntradaCierre {
  tipo: HistorialTipo;
  id: string;
  mesa: number;
  camarero: string;
  creadaEn: string;
  estadoPanel: EstadoPanel;
}

export const FILTRO_TODOS_CAMARERO = "todos";

export const ESTADOS_CIERRE: { id: FiltroEstadoCierre; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "pendiente", label: "Pendiente" },
  { id: "en_preparacion", label: "En preparación" },
  { id: "listo", label: "Listo" },
  { id: "servido", label: "Servido" },
];

export const TIPOS_CIERRE: { id: FiltroTipoCierre; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "cocina", label: "Cocina" },
  { id: "postres", label: "Postres" },
];
