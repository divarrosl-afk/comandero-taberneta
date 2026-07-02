import type { ComandaCocina, TipoServicio } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";
import { normalizeEstadoPanel } from "@/types/panel";
import type { ComandaPostres, EstadoPostreX } from "@/types/postres";

export interface ComandaPersistMeta {
  camareroUsername?: string | null;
  mesaId?: string | null;
  mesaCodigo?: string | null;
}

export interface DbComandaCocina {
  id: string;
  restaurante_id: string;
  mesa_codigo: string;
  mesa_id: string | null;
  camarero_username: string | null;
  camarero_nombre: string;
  tipo_servicio: TipoServicio;
  entrantes: ComandaCocina["entrantes"];
  primeros: ComandaCocina["primeros"];
  segundos: ComandaCocina["segundos"];
  bebidas: ComandaCocina["bebidas"];
  extras: ComandaCocina["extras"];
  observaciones: string[];
  estado_panel: EstadoPanel;
  enviada: boolean;
  creada_en: string;
  deleted_at: string | null;
}

export interface DbComandaPostres {
  id: string;
  restaurante_id: string;
  mesa_codigo: string;
  mesa_id: string | null;
  camarero_username: string | null;
  camarero_nombre: string;
  postres: ComandaPostres["postres"];
  estado_x: EstadoPostreX | null;
  cl_h: boolean;
  observaciones: string[];
  estado_panel: EstadoPanel;
  enviada: boolean;
  creada_en: string;
  deleted_at: string | null;
}

function normalizarPlatos<T extends { modificaciones?: string[]; salsas?: { nombre: string; cantidad: number }[] }>(
  platos: T[],
): T[] {
  return platos.map((p) => ({
    ...p,
    modificaciones: p.modificaciones ?? [],
    salsas: p.salsas ?? [],
  }));
}

export function rowToComandaCocina(row: DbComandaCocina): ComandaCocina {
  return {
    id: row.id,
    mesa: row.mesa_id ?? row.mesa_codigo,
    mesaCodigo: row.mesa_codigo,
    camarero: row.camarero_nombre,
    tipoServicio: row.tipo_servicio,
    entrantes: normalizarPlatos(row.entrantes ?? []),
    primeros: normalizarPlatos(row.primeros ?? []),
    segundos: normalizarPlatos(row.segundos ?? []),
    bebidas: normalizarPlatos(row.bebidas ?? []),
    extras: row.extras ?? [],
    observaciones: Array.isArray(row.observaciones) ? row.observaciones : [],
    creadaEn: row.creada_en,
    enviada: row.enviada ?? true,
    estadoPanel: normalizeEstadoPanel(row.estado_panel),
  };
}

export function comandaToRow(
  comanda: ComandaCocina,
  restauranteId: string,
  meta?: ComandaPersistMeta,
): DbComandaCocina {
  const mesaCodigo =
    meta?.mesaCodigo?.trim().toUpperCase() ??
    String(comanda.mesa).trim().toUpperCase();

  return {
    id: comanda.id,
    restaurante_id: restauranteId,
    mesa_codigo: mesaCodigo,
    mesa_id: meta?.mesaId ?? null,
    camarero_username: meta?.camareroUsername ?? null,
    camarero_nombre: comanda.camarero,
    tipo_servicio: comanda.tipoServicio,
    entrantes: comanda.entrantes,
    primeros: comanda.primeros,
    segundos: comanda.segundos,
    bebidas: comanda.bebidas,
    extras: comanda.extras,
    observaciones: comanda.observaciones,
    estado_panel: comanda.estadoPanel,
    enviada: comanda.enviada,
    creada_en: comanda.creadaEn,
    deleted_at: null,
  };
}

export function rowToComandaPostres(row: DbComandaPostres): ComandaPostres {
  return {
    id: row.id,
    mesa: row.mesa_id ?? row.mesa_codigo,
    mesaCodigo: row.mesa_codigo,
    camarero: row.camarero_nombre,
    postres: row.postres ?? [],
    estadoX: row.estado_x,
    clH: row.cl_h,
    observaciones: Array.isArray(row.observaciones) ? row.observaciones : [],
    creadaEn: row.creada_en,
    enviada: row.enviada ?? true,
    estadoPanel: normalizeEstadoPanel(row.estado_panel),
  };
}

export function comandaPostresToRow(
  comanda: ComandaPostres,
  restauranteId: string,
  meta?: ComandaPersistMeta,
): DbComandaPostres {
  const mesaCodigo =
    meta?.mesaCodigo?.trim().toUpperCase() ??
    String(comanda.mesa).trim().toUpperCase();

  return {
    id: comanda.id,
    restaurante_id: restauranteId,
    mesa_codigo: mesaCodigo,
    mesa_id: meta?.mesaId ?? null,
    camarero_username: meta?.camareroUsername ?? null,
    camarero_nombre: comanda.camarero,
    postres: comanda.postres,
    estado_x: comanda.estadoX,
    cl_h: comanda.clH,
    observaciones: comanda.observaciones,
    estado_panel: comanda.estadoPanel,
    enviada: comanda.enviada,
    creada_en: comanda.creadaEn,
    deleted_at: null,
  };
}
