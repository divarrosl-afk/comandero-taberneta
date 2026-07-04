import { buildComandaPersistMeta } from "@/lib/comandas/comanda-persist-meta";
import { createId } from "@/lib/id/create-id";
import { esMismaFecha } from "@/lib/cierre/fecha";
import { getComandasRepository } from "@/lib/data/data-layer";
import { usesRemoteData } from "@/lib/data/backend";
import { getComandasLocales } from "@/lib/storage/comandas-local";
import {
  enqueueCocinaCreate,
  enqueueCocinaEstado,
  removeOutboxForEntity,
} from "@/lib/sync/outbox";
import {
  getComandasCache,
  setComandasCache,
} from "@/lib/sync/operativa-cache";
import {
  loadOperativaMerged,
  patchCocinaInCache,
} from "@/lib/sync/operativa-read";
import { flushOutbox } from "@/lib/sync/sync-worker";
import type { ComandaCocina } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";

export interface PersistResult<T> {
  data: T;
  synced: boolean;
  error?: string;
}

export function generarIdComanda(): string {
  return createId();
}

export function getComandasSync(): ComandaCocina[] {
  if (!usesRemoteData()) return getComandasLocales();
  return getComandasCache();
}

export async function fetchComandas(): Promise<ComandaCocina[]> {
  const { cocina } = await loadOperativaMerged();
  return cocina;
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

  const cached = getComandasCache();
  setComandasCache([comanda, ...cached.filter((c) => c.id !== comanda.id)]);

  try {
    const meta = await buildComandaPersistMeta(
      comanda.mesa,
      opts?.camareroUsername,
    );
    const guardada = await repo.crear(comanda, meta);
    await removeOutboxForEntity(["cocina_create", "cocina_estado"], comanda.id);
    await loadOperativaMerged();
    void flushOutbox();
    return { data: guardada, synced: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Error de sincronización";
    await enqueueCocinaCreate(comanda);
    void flushOutbox();
    return { data: comanda, synced: false, error };
  }
}

export async function actualizarEstadoComanda(
  id: string,
  estado: EstadoPanel,
): Promise<ComandaCocina | null> {
  if (!usesRemoteData()) {
    return getComandasRepository().actualizarEstado(id, estado);
  }

  const patched = patchCocinaInCache(id, { estadoPanel: estado });
  if (!patched) return null;

  try {
    const actualizada = await getComandasRepository().actualizarEstado(
      id,
      estado,
    );
    if (actualizada) {
      await removeOutboxForEntity(["cocina_estado"], id);
      await loadOperativaMerged();
      void flushOutbox();
      return actualizada;
    }
  } catch {
    // offline — encolar
  }

  await enqueueCocinaEstado(id, estado, patched);
  void flushOutbox();
  return patchCocinaInCache(id, { estadoPanel: estado });
}

export async function eliminarComanda(id: string): Promise<boolean> {
  const eraPendiente = getComandasCache().some((c) => c.id === id);
  await removeOutboxForEntity(["cocina_create", "cocina_estado"], id);

  const filtradas = getComandasCache().filter((c) => c.id !== id);
  setComandasCache(filtradas);

  try {
    await getComandasRepository().eliminar(id);
    if (usesRemoteData()) await loadOperativaMerged();
    return true;
  } catch {
    if (usesRemoteData()) await loadOperativaMerged();
    return eraPendiente;
  }
}

export async function eliminarComandasDelDia(fecha: string): Promise<number> {
  if (!usesRemoteData()) {
    return getComandasRepository().eliminarDelDia(fecha);
  }

  const enDia = getComandasSync().filter((c) =>
    esMismaFecha(c.creadaEn, fecha),
  );
  const ids = enDia.map((c) => c.id);

  for (const id of ids) {
    await removeOutboxForEntity(["cocina_create", "cocina_estado"], id);
  }

  setComandasCache(
    getComandasSync().filter((c) => !esMismaFecha(c.creadaEn, fecha)),
  );

  let remoto = 0;
  try {
    remoto = await getComandasRepository().eliminarDelDia(fecha);
  } catch {
    remoto = 0;
  }

  await loadOperativaMerged();
  return Math.max(ids.length, remoto);
}
