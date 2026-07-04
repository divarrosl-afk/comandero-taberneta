import { createClient } from "@supabase/supabase-js";
import { esMismaFecha } from "@/lib/cierre/fecha";
import {
  comandaPostresToRow,
  comandaToRow,
  rowToComandaCocina,
  rowToComandaPostres,
  type ComandaPersistMeta,
  type DbComandaCocina,
  type DbComandaPostres,
} from "@/lib/supabase/comandas-mappers";
import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";
import type { EstadoPanel } from "@/types/panel";

const RESTAURANTE_ID =
  process.env.NEXT_PUBLIC_RESTAURANTE_ID?.trim() ?? "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "";

function clientConToken(token: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

function assertRestaurante(): string {
  if (!RESTAURANTE_ID) throw new Error("restauranteId no configurado");
  return RESTAURANTE_ID;
}

// --- Cocina ---

export async function listarComandasCocina(token: string): Promise<ComandaCocina[]> {
  const client = clientConToken(token);
  const restauranteId = assertRestaurante();

  const { data, error } = await client
    .from("comandas_cocina")
    .select("*")
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null)
    .order("creada_en", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data) return [];
  return (data as DbComandaCocina[]).map(rowToComandaCocina);
}

export async function obtenerComandaCocina(
  token: string,
  id: string,
): Promise<ComandaCocina | undefined> {
  const todas = await listarComandasCocina(token);
  return todas.find((c) => c.id === id);
}

export async function crearComandaCocina(
  token: string,
  comanda: ComandaCocina,
  meta?: ComandaPersistMeta,
): Promise<ComandaCocina> {
  const client = clientConToken(token);
  const restauranteId = assertRestaurante();
  const row = comandaToRow(comanda, restauranteId, meta);

  const { data, error } = await client
    .from("comandas_cocina")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Error al guardar comanda");
  }
  return rowToComandaCocina(data as DbComandaCocina);
}

export async function actualizarComandaCocina(
  token: string,
  id: string,
  cambios: Partial<ComandaCocina>,
): Promise<ComandaCocina | null> {
  const actual = await obtenerComandaCocina(token, id);
  if (!actual) return null;

  const merged = { ...actual, ...cambios };
  const client = clientConToken(token);
  const restauranteId = assertRestaurante();
  const row = comandaToRow(merged, restauranteId, {
    mesaId: merged.mesa,
    mesaCodigo: String(merged.mesa),
  });

  const { data, error } = await client
    .from("comandas_cocina")
    .update({
      mesa_codigo: row.mesa_codigo,
      mesa_id: row.mesa_id,
      camarero_nombre: row.camarero_nombre,
      tipo_servicio: row.tipo_servicio,
      entrantes: row.entrantes,
      primeros: row.primeros,
      segundos: row.segundos,
      bebidas: row.bebidas,
      extras: row.extras,
      observaciones: row.observaciones,
      estado_panel: row.estado_panel,
      enviada: row.enviada,
    })
    .eq("id", id)
    .eq("restaurante_id", restauranteId)
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToComandaCocina(data as DbComandaCocina);
}

export async function actualizarEstadoComandaCocina(
  token: string,
  id: string,
  estado: EstadoPanel,
): Promise<ComandaCocina | null> {
  const client = clientConToken(token);
  const restauranteId = assertRestaurante();

  const { data, error } = await client
    .from("comandas_cocina")
    .update({ estado_panel: estado })
    .eq("id", id)
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToComandaCocina(data as DbComandaCocina);
}

export async function eliminarComandaCocina(
  token: string,
  id: string,
): Promise<boolean> {
  const client = clientConToken(token);
  const restauranteId = assertRestaurante();

  const { error } = await client
    .from("comandas_cocina")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null);

  if (error) throw new Error(error.message);
  return true;
}

export async function eliminarComandasCocinaDelDia(
  token: string,
  fecha: string,
): Promise<number> {
  const client = clientConToken(token);
  const restauranteId = assertRestaurante();

  const { data, error } = await client
    .from("comandas_cocina")
    .select("id, creada_en")
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null);

  if (error) throw new Error(error.message);
  if (!data) return 0;

  const ids = data
    .filter((r) => esMismaFecha(r.creada_en as string, fecha))
    .map((r) => r.id as string);

  if (ids.length === 0) return 0;

  const { error: delError } = await client
    .from("comandas_cocina")
    .update({ deleted_at: new Date().toISOString() })
    .in("id", ids)
    .is("deleted_at", null);

  if (delError) throw new Error(delError.message);
  return ids.length;
}

// --- Postres ---

export async function listarComandasPostres(token: string): Promise<ComandaPostres[]> {
  const client = clientConToken(token);
  const restauranteId = assertRestaurante();

  const { data, error } = await client
    .from("comandas_postres")
    .select("*")
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null)
    .order("creada_en", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data) return [];
  return (data as DbComandaPostres[]).map(rowToComandaPostres);
}

export async function obtenerComandaPostres(
  token: string,
  id: string,
): Promise<ComandaPostres | undefined> {
  const todas = await listarComandasPostres(token);
  return todas.find((c) => c.id === id);
}

export async function crearComandaPostres(
  token: string,
  comanda: ComandaPostres,
  meta?: ComandaPersistMeta,
): Promise<ComandaPostres> {
  const client = clientConToken(token);
  const restauranteId = assertRestaurante();
  const row = comandaPostresToRow(comanda, restauranteId, meta);

  const { data, error } = await client
    .from("comandas_postres")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Error al guardar postres");
  }
  return rowToComandaPostres(data as DbComandaPostres);
}

export async function actualizarComandaPostres(
  token: string,
  id: string,
  cambios: Partial<ComandaPostres>,
): Promise<ComandaPostres | null> {
  const actual = await obtenerComandaPostres(token, id);
  if (!actual) return null;

  const merged = { ...actual, ...cambios };
  const client = clientConToken(token);
  const restauranteId = assertRestaurante();
  const row = comandaPostresToRow(merged, restauranteId, {
    mesaId: merged.mesa,
    mesaCodigo: String(merged.mesa),
  });

  const { data, error } = await client
    .from("comandas_postres")
    .update({
      mesa_codigo: row.mesa_codigo,
      mesa_id: row.mesa_id,
      camarero_nombre: row.camarero_nombre,
      postres: row.postres,
      estado_x: row.estado_x,
      cl_h: row.cl_h,
      observaciones: row.observaciones,
      estado_panel: row.estado_panel,
      enviada: row.enviada,
    })
    .eq("id", id)
    .eq("restaurante_id", restauranteId)
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToComandaPostres(data as DbComandaPostres);
}

export async function actualizarEstadoComandaPostres(
  token: string,
  id: string,
  estado: EstadoPanel,
): Promise<ComandaPostres | null> {
  const client = clientConToken(token);
  const restauranteId = assertRestaurante();

  const { data, error } = await client
    .from("comandas_postres")
    .update({ estado_panel: estado })
    .eq("id", id)
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToComandaPostres(data as DbComandaPostres);
}

export async function eliminarComandaPostres(
  token: string,
  id: string,
): Promise<boolean> {
  const client = clientConToken(token);
  const restauranteId = assertRestaurante();

  const { error } = await client
    .from("comandas_postres")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null);

  if (error) throw new Error(error.message);
  return true;
}

export async function eliminarComandasPostresDelDia(
  token: string,
  fecha: string,
): Promise<number> {
  const client = clientConToken(token);
  const restauranteId = assertRestaurante();

  const { data, error } = await client
    .from("comandas_postres")
    .select("id, creada_en")
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null);

  if (error) throw new Error(error.message);
  if (!data) return 0;

  const ids = data
    .filter((r) => esMismaFecha(r.creada_en as string, fecha))
    .map((r) => r.id as string);

  if (ids.length === 0) return 0;

  const { error: delError } = await client
    .from("comandas_postres")
    .update({ deleted_at: new Date().toISOString() })
    .in("id", ids)
    .is("deleted_at", null);

  if (delError) throw new Error(delError.message);
  return ids.length;
}
