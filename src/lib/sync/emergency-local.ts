import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";
import type { EstadoPanel } from "@/types/panel";
import {
  countOutbox,
  enqueueCocinaCreate,
  enqueueCocinaEstado,
  enqueuePostresCreate,
  enqueuePostresEstado,
  getOutboxPendingCocinaSync,
  getOutboxPendingPostresSync,
  hydrateOutboxMirror,
  removeOutboxForEntity,
} from "@/lib/sync/outbox";

/** @deprecated Usar outbox IndexedDB — facade para compatibilidad. */

export function getPendingCocina(): ComandaCocina[] {
  return getOutboxPendingCocinaSync();
}

export function getPendingPostres(): ComandaPostres[] {
  return getOutboxPendingPostresSync();
}

export function addPendingCocina(item: ComandaCocina): void {
  void enqueueCocinaCreate(item);
}

export function addPendingPostres(item: ComandaPostres): void {
  void enqueuePostresCreate(item);
}

export function removePendingCocina(id: string): void {
  void removeOutboxForEntity(["cocina_create", "cocina_estado"], id);
}

export function removePendingPostres(id: string): void {
  void removeOutboxForEntity(["postres_create", "postres_estado"], id);
}

export function updatePendingCocinaEstado(
  id: string,
  estado: EstadoPanel,
): ComandaCocina | null {
  void enqueueCocinaEstado(id, estado);
  return getOutboxPendingCocinaSync().find((c) => c.id === id) ?? null;
}

export function updatePendingPostresEstado(
  id: string,
  estado: EstadoPanel,
): ComandaPostres | null {
  void enqueuePostresEstado(id, estado);
  return getOutboxPendingPostresSync().find((c) => c.id === id) ?? null;
}

export async function countPendingSync(): Promise<number> {
  try {
    return await countOutbox();
  } catch {
    return getPendingCocina().length + getPendingPostres().length;
  }
}

export function countPendingSyncLegacy(): number {
  return getPendingCocina().length + getPendingPostres().length;
}

export async function clearPendingSync(): Promise<void> {
  await hydrateOutboxMirror();
}
