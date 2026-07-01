import { buildComandaPersistMeta } from "@/lib/comandas/comanda-persist-meta";
import { getComandasRepository } from "@/lib/data/data-layer";
import { usesRemoteData } from "@/lib/data/backend";
import { getComandasLocales } from "@/lib/storage/comandas-local";
import {
  addPendingCocina,
  getPendingCocina,
  removePendingCocina,
  updatePendingCocinaEstado,
} from "@/lib/sync/emergency-local";
import { mergeOperativa } from "@/lib/sync/merge-operativa";
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

async function loadComandasMerged(): Promise<ComandaCocina[]> {
  const remoto = await getComandasRepository().getAll();
  const merged = usesRemoteData()
    ? mergeOperativa(remoto, getPendingCocina())
    : remoto;
  setComandasCache(merged);
  return merged;
}

export async function fetchComandas(): Promise<ComandaCocina[]> {
  return loadComandasMerged();
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
    removePendingCocina(comanda.id);
    await loadComandasMerged();
    return { data: guardada, synced: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Error de sincronización";
    addPendingCocina(comanda);
    const merged = mergeOperativa(await repo.getAll(), getPendingCocina());
    setComandasCache(merged);
    return { data: comanda, synced: false, error };
  }
}

export async function actualizarEstadoComanda(
  id: string,
  estado: EstadoPanel,
): Promise<ComandaCocina | null> {
  const actualizada = await getComandasRepository().actualizarEstado(id, estado);
  if (actualizada) {
    removePendingCocina(id);
    if (usesRemoteData()) await loadComandasMerged();
    return actualizada;
  }

  const pendiente = updatePendingCocinaEstado(id, estado);
  if (pendiente && usesRemoteData()) {
    const merged = mergeOperativa(
      await getComandasRepository().getAll(),
      getPendingCocina(),
    );
    setComandasCache(merged);
    return pendiente;
  }

  return null;
}

export async function eliminarComanda(id: string): Promise<boolean> {
  const eraPendiente = getPendingCocina().some((c) => c.id === id);
  removePendingCocina(id);
  try {
    await getComandasRepository().eliminar(id);
    if (usesRemoteData()) await loadComandasMerged();
    return true;
  } catch {
    if (eraPendiente && usesRemoteData()) await loadComandasMerged();
    return eraPendiente;
  }
}

export async function eliminarComandasDelDia(fecha: string): Promise<number> {
  const n = await getComandasRepository().eliminarDelDia(fecha);
  if (usesRemoteData()) await loadComandasMerged();
  return n;
}
