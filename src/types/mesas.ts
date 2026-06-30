export type ZonaMesa =
  | "comedor"
  | "barra"
  | "fachada"
  | "terraza"
  | "rambla";

export type EstadoMesaOperativo =
  | "libre"
  | "ocupada"
  | "pendiente"
  | "servida"
  | "cobrando";

export interface MesaConfig {
  id: string;
  codigo: string;
  nombreVisible: string;
  zona: ZonaMesa;
  activa: boolean;
  orden: number;
  /** Solo rambla: permite mesa secundaria B (ej. R2 → R2B) */
  permiteVarianteB: boolean;
  esVarianteB: boolean;
  mesaPrincipalId?: string;
}

export interface MesaEstadoPersistido {
  mesaId: string;
  estado: EstadoMesaOperativo;
  /** Si es manual (cobrando/liberar), no se sobrescribe hasta liberar */
  manual: boolean;
  actualizadaEn: string;
}

export interface MesaOperativa extends MesaConfig {
  estado: EstadoMesaOperativo;
}

export const ZONAS_MESA: { id: ZonaMesa; label: string }[] = [
  { id: "comedor", label: "Comedor" },
  { id: "barra", label: "Barra" },
  { id: "fachada", label: "Fachada" },
  { id: "terraza", label: "Terraza" },
  { id: "rambla", label: "Rambla" },
];

export const ESTADOS_MESA: {
  id: EstadoMesaOperativo;
  label: string;
  color: string;
}[] = [
  { id: "libre", label: "Libre", color: "bg-stone-100 text-stone-700 border-stone-300" },
  { id: "ocupada", label: "Ocupada", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { id: "pendiente", label: "Pendiente", color: "bg-amber-100 text-amber-900 border-amber-300" },
  { id: "servida", label: "Servida", color: "bg-green-100 text-green-800 border-green-300" },
  { id: "cobrando", label: "Cobrando", color: "bg-purple-100 text-purple-800 border-purple-300" },
];

export function labelZona(zona: ZonaMesa): string {
  return ZONAS_MESA.find((z) => z.id === zona)?.label ?? zona;
}

export function labelEstadoMesa(estado: EstadoMesaOperativo): string {
  return ESTADOS_MESA.find((e) => e.id === estado)?.label ?? estado;
}

export function estiloEstadoMesa(estado: EstadoMesaOperativo): string {
  return (
    ESTADOS_MESA.find((e) => e.id === estado)?.color ??
    "bg-stone-100 text-stone-700 border-stone-300"
  );
}

export function codigoVarianteB(codigoPrincipal: string): string {
  return `${codigoPrincipal}B`;
}
