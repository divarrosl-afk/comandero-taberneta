import { buildComandaPersistMeta } from "@/lib/comandas/comanda-persist-meta";
import { createId } from "@/lib/id/create-id";
import { ensureUuid } from "@/lib/id/uuid";
import { esMismaFecha } from "@/lib/cierre/fecha";
import { getComandasRepository, isRemoteOperativaReady } from "@/lib/data/data-layer";
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
import { dispatchAppSync } from "@/lib/sync/app-sync";
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

function upsertCocinaCache(comanda: ComandaCocina): void {
  setComandasCache([
    comanda,
    ...getComandasCache().filter((c) => c.id !== comanda.id),
  ]);
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
  const comandaRemota = usesRemoteData()
    ? { ...comanda, id: ensureUuid(comanda.id) }
    : comanda;

  if (!usesRemoteData()) {
    const guardada = await repo.crear(comandaRemota);
    return { data: guardada, synced: true };
  }

  upsertCocinaCache(comandaRemota);

  if (!isRemoteOperativaReady()) {
    const error = "Servidor no listo — la comanda queda en cola de sincronización";
    console.error("[comandas]", error);
    await enqueueCocinaCreate(comandaRemota);
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
      ["cocina_create", "cocina_estado"],
      comandaRemota.id,
    );
    upsertCocinaCache(guardada);
    void flushOutbox();
    dispatchAppSync();
    return { data: guardada, synced: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Error de sincronización";
    console.error("[comandas] Error al guardar en Supabase:", error);
    await enqueueCocinaCreate(comandaRemota);
    void flushOutbox();
    dispatchAppSync();
    return { data: comandaRemota, synced: false, error };
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
      upsertCocinaCache(actualizada);
      void flushOutbox();
      dispatchAppSync();
      return actualizada;
    }
  } catch {
    // offline — encolar
  }

  await enqueueCocinaEstado(id, estado, patched);
  void flushOutbox();
  dispatchAppSync();
  return patchCocinaInCache(id, { estadoPanel: estado });
}

export async function eliminarComanda(id: string): Promise<boolean> {
  const anterior = getComandasCache();
  const eraPendiente = anterior.some((c) => c.id === id);
  await removeOutboxForEntity(["cocina_create", "cocina_estado"], id);

  setComandasCache(anterior.filter((c) => c.id !== id));

  try {
    await getComandasRepository().eliminar(id);
    if (usesRemoteData()) await loadOperativaMerged();
    dispatchAppSync();
    return true;
  } catch (error) {
    setComandasCache(anterior);
    if (usesRemoteData()) await loadOperativaMerged();
    dispatchAppSync();
    if (eraPendiente && !usesRemoteData()) return true;
    throw error;
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
  dispatchAppSync();
  return Math.max(ids.length, remoto);
}
