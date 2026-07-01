import { buildComandaPersistMeta } from "@/lib/comandas/comanda-persist-meta";
import type { ComandasRepository } from "@/lib/comandas/comandas-repository";
import { getComandasRepository } from "@/lib/data/data-layer";
import { usesRemoteData } from "@/lib/data/backend";
import {
  getComandasLocales,
  guardarComandaLocal,
} from "@/lib/storage/comandas-local";
import { addPendingCocina } from "@/lib/sync/emergency-local";
import {
  getComandasCache,
  setComandasCache,
} from "@/lib/sync/operativa-cache";
import type { ComandaCocina } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";

export interface PersistResult<T> {
  data: T;
  synced: boolean;
  error?: string;
}

export function generarIdComanda(): string {
  return crypto.randomUUID();
}

export function getComandasSync(): ComandaCocina[] {
  if (!usesRemoteData()) return getComandasLocales();
  return getComandasCache();
}

export async function fetchComandas(): Promise<ComandaCocina[]> {
  const data = await getComandasRepository().getAll();
  setComandasCache(data);
  return data;
}

export async function guardarComanda(
  comanda: ComandaCocina,
  opts?: { camareroUsername?: string | null },
): Promise<PersistResult<ComandaCocina>> {
  const repo = getComandasRepository();

  if (!usesRemoteData()) {
    const guardada = await repo.crear(comanda);
    return { data: guardada, synced: true };
  }

  try {
    const meta = await buildComandaPersistMeta(
      comanda.mesa,
      opts?.camareroUsername,
    );
    const guardada = await repo.crear(comanda, meta);
    await fetchComandas();
    return { data: guardada, synced: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Error de sincronización";
    guardarComandaLocal(comanda);
    addPendingCocina(comanda);
    setComandasCache([comanda, ...getComandasCache()]);
    return { data: comanda, synced: false, error };
  }
}

export async function actualizarEstadoComanda(
  id: string,
  estado: EstadoPanel,
): Promise<ComandaCocina | null> {
  const actualizada = await getComandasRepository().actualizarEstado(id, estado);
  if (usesRemoteData()) await fetchComandas();
  return actualizada;
}

export async function eliminarComanda(id: string): Promise<boolean> {
  const ok = await getComandasRepository().eliminar(id);
  if (usesRemoteData()) await fetchComandas();
  return ok;
}

export async function eliminarComandasDelDia(fecha: string): Promise<number> {
  const n = await getComandasRepository().eliminarDelDia(fecha);
  if (usesRemoteData()) await fetchComandas();
  return n;
}
