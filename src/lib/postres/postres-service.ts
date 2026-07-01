import { buildComandaPersistMeta } from "@/lib/comandas/comanda-persist-meta";
import type { PersistResult } from "@/lib/comandas/comandas-service";
import { getPostresRepository } from "@/lib/data/data-layer";
import { usesRemoteData } from "@/lib/data/backend";
import { getPostresLocales } from "@/lib/storage/postres-local";
import {
  enqueuePostresCreate,
  enqueuePostresEstado,
  removeOutboxForEntity,
} from "@/lib/sync/outbox";
import {
  getPostresCache,
  setPostresCache,
} from "@/lib/sync/operativa-cache";
import {
  loadOperativaMerged,
  patchPostresInCache,
} from "@/lib/sync/operativa-read";
import { flushOutbox } from "@/lib/sync/sync-worker";
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
  const { postres } = await loadOperativaMerged();
  return postres;
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

  const cached = getPostresCache();
  setPostresCache([comanda, ...cached.filter((c) => c.id !== comanda.id)]);

  try {
    const meta = await buildComandaPersistMeta(
      comanda.mesa,
      opts?.camareroUsername,
    );
    const guardada = await repo.crear(comanda, meta);
    await removeOutboxForEntity(
      ["postres_create", "postres_estado"],
      comanda.id,
    );
    await loadOperativaMerged();
    void flushOutbox();
    return { data: guardada, synced: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Error de sincronización";
    await enqueuePostresCreate(comanda);
    void flushOutbox();
    return { data: comanda, synced: false, error };
  }
}

export async function actualizarEstadoPostres(
  id: string,
  estado: EstadoPanel,
): Promise<ComandaPostres | null> {
  if (!usesRemoteData()) {
    return getPostresRepository().actualizarEstado(id, estado);
  }

  const patched = patchPostresInCache(id, { estadoPanel: estado });
  if (!patched) return null;

  try {
    const actualizada = await getPostresRepository().actualizarEstado(
      id,
      estado,
    );
    if (actualizada) {
      await removeOutboxForEntity(["postres_estado"], id);
      await loadOperativaMerged();
      void flushOutbox();
      return actualizada;
    }
  } catch {
    // offline
  }

  await enqueuePostresEstado(id, estado);
  void flushOutbox();
  return patchPostresInCache(id, { estadoPanel: estado });
}

export async function eliminarPostres(id: string): Promise<boolean> {
  const eraPendiente = getPostresCache().some((c) => c.id === id);
  await removeOutboxForEntity(["postres_create", "postres_estado"], id);

  const filtradas = getPostresCache().filter((c) => c.id !== id);
  setPostresCache(filtradas);

  try {
    await getPostresRepository().eliminar(id);
    if (usesRemoteData()) await loadOperativaMerged();
    return true;
  } catch {
    if (usesRemoteData()) await loadOperativaMerged();
    return eraPendiente;
  }
}

export async function eliminarPostresDelDia(fecha: string): Promise<number> {
  const n = await getPostresRepository().eliminarDelDia(fecha);
  if (usesRemoteData()) await loadOperativaMerged();
  return n;
}
