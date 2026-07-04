import { getComandasRepository, getPostresRepository } from "@/lib/data/data-layer";
import { normalizeEstadoPanel } from "@/types/panel";
import type { EstadoPanel } from "@/types/panel";
import {
  listOutboxEntries,
  removeOutboxForEntity,
} from "@/lib/sync/outbox";
import type { OutboxEntry } from "@/lib/sync/outbox-types";

const MAX_RETRIES = 8;
const BASE_BACKOFF_MS = 2000;

/** Entradas listas para reintento (no en backoff por fallos previos). */
export function isOutboxEntryActionable(entry: OutboxEntry): boolean {
  if (entry.retries >= MAX_RETRIES) return false;
  if (entry.retries === 0) return true;
  const waitUntil =
    new Date(entry.createdAt).getTime() +
    Math.min(BASE_BACKOFF_MS * 2 ** entry.retries, 60_000);
  return Date.now() >= waitUntil;
}

export async function countActionableOutbox(): Promise<number> {
  const entries = await listOutboxEntries();
  return entries.filter(isOutboxEntryActionable).length;
}

/**
 * Elimina entradas huérfanas del outbox cuando el servidor ya tiene el mismo dato.
 */
export async function reconcileOutbox(): Promise<number> {
  const entries = await listOutboxEntries();
  let removed = 0;

  for (const entry of entries) {
    if (entry.kind === "cocina_estado") {
      const { estado } = entry.payload as { estado: EstadoPanel };
      const remota = await getComandasRepository().getById(entry.entityId);
      if (
        remota &&
        normalizeEstadoPanel(remota.estadoPanel) === normalizeEstadoPanel(estado)
      ) {
        await removeOutboxForEntity(["cocina_estado"], entry.entityId);
        removed++;
      }
      continue;
    }

    if (entry.kind === "postres_estado") {
      const { estado } = entry.payload as { estado: EstadoPanel };
      const remota = await getPostresRepository().getById(entry.entityId);
      if (
        remota &&
        normalizeEstadoPanel(remota.estadoPanel) === normalizeEstadoPanel(estado)
      ) {
        await removeOutboxForEntity(["postres_estado"], entry.entityId);
        removed++;
      }
      continue;
    }

    if (entry.kind === "cocina_create") {
      const remota = await getComandasRepository().getById(entry.entityId);
      if (remota) {
        await removeOutboxForEntity(
          ["cocina_create", "cocina_estado"],
          entry.entityId,
        );
        removed++;
      }
      continue;
    }

    if (entry.kind === "postres_create") {
      const remota = await getPostresRepository().getById(entry.entityId);
      if (remota) {
        await removeOutboxForEntity(
          ["postres_create", "postres_estado"],
          entry.entityId,
        );
        removed++;
      }
    }
  }

  return removed;
}
