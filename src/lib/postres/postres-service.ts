import { buildComandaPersistMeta } from "@/lib/comandas/comanda-persist-meta";
import type { PersistResult } from "@/lib/comandas/comandas-service";
import { getPostresRepository } from "@/lib/data/data-layer";
import { usesRemoteData } from "@/lib/data/backend";
import { getPostresLocales } from "@/lib/storage/postres-local";
import {
  addPendingPostres,
  getPendingPostres,
  removePendingPostres,
  updatePendingPostresEstado,
} from "@/lib/sync/emergency-local";
import { mergeOperativa } from "@/lib/sync/merge-operativa";
import {
  getPostresCache,
  setPostresCache,
} from "@/lib/sync/operativa-cache";
import type { ComandaPostres } from "@/types/postres";
import type { EstadoPanel } from "@/types/panel";

export function generarIdPostres(): string {
  return crypto.randomUUID();
}

export function getPostresSync(): ComandaPostres[] {
  if (!usesRemoteData()) return getPostresLocales();
  return getPostresCache();
}

async function loadPostresMerged(): Promise<ComandaPostres[]> {
  const remoto = await getPostresRepository().getAll();
  const merged = usesRemoteData()
    ? mergeOperativa(remoto, getPendingPostres())
    : remoto;
  setPostresCache(merged);
  return merged;
}

export async function fetchPostres(): Promise<ComandaPostres[]> {
  return loadPostresMerged();
}

export async function guardarPostres(
  comanda: ComandaPostres,
  opts?: { camareroUsername?: string | null },
): Promise<PersistResult<ComandaPostres>> {
  const repo = getPostresRepository();

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
    removePendingPostres(comanda.id);
    await loadPostresMerged();
    return { data: guardada, synced: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Error de sincronización";
    addPendingPostres(comanda);
    const merged = mergeOperativa(await repo.getAll(), getPendingPostres());
    setPostresCache(merged);
    return { data: comanda, synced: false, error };
  }
}

export async function actualizarEstadoPostres(
  id: string,
  estado: EstadoPanel,
): Promise<ComandaPostres | null> {
  const actualizada = await getPostresRepository().actualizarEstado(id, estado);
  if (actualizada) {
    removePendingPostres(id);
    if (usesRemoteData()) await loadPostresMerged();
    return actualizada;
  }

  const pendiente = updatePendingPostresEstado(id, estado);
  if (pendiente && usesRemoteData()) {
    const merged = mergeOperativa(
      await getPostresRepository().getAll(),
      getPendingPostres(),
    );
    setPostresCache(merged);
    return pendiente;
  }

  return null;
}

export async function eliminarPostres(id: string): Promise<boolean> {
  const eraPendiente = getPendingPostres().some((c) => c.id === id);
  removePendingPostres(id);
  const ok = await getPostresRepository().eliminar(id);
  if (usesRemoteData()) await loadPostresMerged();
  return ok || eraPendiente;
}

export async function eliminarPostresDelDia(fecha: string): Promise<number> {
  const n = await getPostresRepository().eliminarDelDia(fecha);
  if (usesRemoteData()) await loadPostresMerged();
  return n;
}
