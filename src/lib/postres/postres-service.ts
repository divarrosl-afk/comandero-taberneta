import { buildComandaPersistMeta } from "@/lib/comandas/comanda-persist-meta";
import { getPostresRepository } from "@/lib/data/data-layer";
import { usesRemoteData } from "@/lib/data/backend";
import {
  getPostresLocales,
  guardarPostresLocal,
} from "@/lib/storage/postres-local";
import { addPendingPostres } from "@/lib/sync/emergency-local";
import {
  getPostresCache,
  setPostresCache,
} from "@/lib/sync/operativa-cache";
import type { PersistResult } from "@/lib/comandas/comandas-service";
import type { ComandaPostres } from "@/types/postres";
import type { EstadoPanel } from "@/types/panel";

export function generarIdPostres(): string {
  return crypto.randomUUID();
}

export function getPostresSync(): ComandaPostres[] {
  if (!usesRemoteData()) return getPostresLocales();
  return getPostresCache();
}

export async function fetchPostres(): Promise<ComandaPostres[]> {
  const data = await getPostresRepository().getAll();
  setPostresCache(data);
  return data;
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
    await fetchPostres();
    return { data: guardada, synced: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Error de sincronización";
    guardarPostresLocal(comanda);
    addPendingPostres(comanda);
    setPostresCache([comanda, ...getPostresCache()]);
    return { data: comanda, synced: false, error };
  }
}

export async function actualizarEstadoPostres(
  id: string,
  estado: EstadoPanel,
): Promise<ComandaPostres | null> {
  const actualizada = await getPostresRepository().actualizarEstado(id, estado);
  if (usesRemoteData()) await fetchPostres();
  return actualizada;
}

export async function eliminarPostres(id: string): Promise<boolean> {
  const ok = await getPostresRepository().eliminar(id);
  if (usesRemoteData()) await fetchPostres();
  return ok;
}

export async function eliminarPostresDelDia(fecha: string): Promise<number> {
  const n = await getPostresRepository().eliminarDelDia(fecha);
  if (usesRemoteData()) await fetchPostres();
  return n;
}
