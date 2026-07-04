import { buildComandaPersistMeta } from "@/lib/comandas/comanda-persist-meta";
import { createId } from "@/lib/id/create-id";
import { ensureUuid } from "@/lib/id/uuid";
import { esMismaFecha } from "@/lib/cierre/fecha";
import type { PersistResult } from "@/lib/comandas/comandas-service";
import { getPostresRepository, isRemoteOperativaReady } from "@/lib/data/data-layer";
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
import { dispatchAppSync } from "@/lib/sync/app-sync";
import { flushOutbox } from "@/lib/sync/sync-worker";
import type { ComandaPostres } from "@/types/postres";
import type { EstadoPanel } from "@/types/panel";

export function generarIdPostres(): string {
  return createId();
}

function upsertPostresCache(comanda: ComandaPostres): void {
  setPostresCache([
    comanda,
    ...getPostresCache().filter((c) => c.id !== comanda.id),
  ]);
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
  const comandaRemota = usesRemoteData()
    ? { ...comanda, id: ensureUuid(comanda.id) }
    : comanda;

  if (!usesRemoteData()) {
    const guardada = await repo.crear(comandaRemota);
    return { data: guardada, synced: true };
  }

  upsertPostresCache(comandaRemota);

  if (!isRemoteOperativaReady()) {
    const error = "Servidor no listo — la comanda queda en cola de sincronización";
    console.error("[postres]", error);
    await enqueuePostresCreate(comandaRemota);
    void flushOutbox();
    dispatchAppSync();
    return { data: comandaRemota, synced: false, error };
  }

  try {
    const meta = await buildComandaPersistMeta(
      comandaRemota.mesa,
      opts?.camareroUsername,
    );
    const guardada = await repo.crear(comandaRemota, meta);
    await removeOutboxForEntity(
      ["postres_create", "postres_estado"],
      comandaRemota.id,
    );
    upsertPostresCache(guardada);
    void flushOutbox();
    dispatchAppSync();
    return { data: guardada, synced: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Error de sincronización";
    console.error("[postres] Error al guardar en Supabase:", error);
    await enqueuePostresCreate(comandaRemota);
    void flushOutbox();
    dispatchAppSync();
    return { data: comandaRemota, synced: false, error };
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
      upsertPostresCache(actualizada);
      void flushOutbox();
      dispatchAppSync();
      return actualizada;
    }
  } catch {
    // offline
  }

  await enqueuePostresEstado(id, estado);
  void flushOutbox();
  dispatchAppSync();
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
    dispatchAppSync();
    return true;
  } catch {
    if (usesRemoteData()) await loadOperativaMerged();
    dispatchAppSync();
    return eraPendiente;
  }
}

export async function eliminarPostresDelDia(fecha: string): Promise<number> {
  if (!usesRemoteData()) {
    return getPostresRepository().eliminarDelDia(fecha);
  }

  const enDia = getPostresSync().filter((c) =>
    esMismaFecha(c.creadaEn, fecha),
  );
  const ids = enDia.map((c) => c.id);

  for (const id of ids) {
    await removeOutboxForEntity(["postres_create", "postres_estado"], id);
  }

  setPostresCache(
    getPostresSync().filter((c) => !esMismaFecha(c.creadaEn, fecha)),
  );

  let remoto = 0;
  try {
    remoto = await getPostresRepository().eliminarDelDia(fecha);
  } catch {
    remoto = 0;
  }

  await loadOperativaMerged();
  dispatchAppSync();
  return Math.max(ids.length, remoto);
}
