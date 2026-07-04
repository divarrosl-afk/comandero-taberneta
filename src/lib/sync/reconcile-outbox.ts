import { getComandasRepository, getPostresRepository } from "@/lib/data/data-layer";
import { getSupabaseAccessToken } from "@/lib/supabase/client";
import { normalizeEstadoPanel } from "@/types/panel";
import type { EstadoPanel } from "@/types/panel";
import {
  listOutboxEntries,
  removeOutboxForEntity,
} from "@/lib/sync/outbox";
import type { OutboxEntry } from "@/lib/sync/outbox-types";

export const MAX_RETRIES = 8;
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

function isCreateKind(kind: OutboxEntry["kind"]): boolean {
  return kind === "cocina_create" || kind === "postres_create";
}

function hasPendingCreate(
  entries: OutboxEntry[],
  entityId: string,
  kind: "cocina_create" | "postres_create",
): boolean {
  return entries.some((e) => e.kind === kind && e.entityId === entityId);
}

async function discardEntry(
  entry: OutboxEntry,
  removed: { count: number },
): Promise<void> {
  if (entry.kind === "cocina_create" || entry.kind === "cocina_estado") {
    await removeOutboxForEntity(
      ["cocina_create", "cocina_estado"],
      entry.entityId,
    );
  } else {
    await removeOutboxForEntity(
      ["postres_create", "postres_estado"],
      entry.entityId,
    );
  }
  removed.count++;
}

/**
 * Elimina entradas huérfanas del outbox cuando el servidor ya tiene el mismo dato
 * o cuando otro dispositivo tiene un estado distinto (Supabase gana).
 */
export async function reconcileOutbox(): Promise<number> {
  const token = await getSupabaseAccessToken();
  if (!token) return 0;

  try {
    await getComandasRepository().getAll();
  } catch {
    return 0;
  }

  const entries = await listOutboxEntries();
  const removed = { count: 0 };

  for (const entry of entries) {
    if (!isOutboxEntryActionable(entry) && entry.retries >= MAX_RETRIES) {
      if (isCreateKind(entry.kind)) {
        continue;
      }
      await discardEntry(entry, removed);
      continue;
    }

    if (entry.kind === "cocina_estado") {
      const { estado } = entry.payload as { estado: EstadoPanel };
      if (hasPendingCreate(entries, entry.entityId, "cocina_create")) {
        continue;
      }
      const remota = await getComandasRepository().getById(entry.entityId);
      if (!remota) {
        continue;
      }
      if (normalizeEstadoPanel(remota.estadoPanel) === normalizeEstadoPanel(estado)) {
        await removeOutboxForEntity(["cocina_estado"], entry.entityId);
        removed.count++;
      }
      continue;
    }

    if (entry.kind === "postres_estado") {
      const { estado } = entry.payload as { estado: EstadoPanel };
      if (hasPendingCreate(entries, entry.entityId, "postres_create")) {
        continue;
      }
      const remota = await getPostresRepository().getById(entry.entityId);
      if (!remota) {
        continue;
      }
      if (normalizeEstadoPanel(remota.estadoPanel) === normalizeEstadoPanel(estado)) {
        await removeOutboxForEntity(["postres_estado"], entry.entityId);
        removed.count++;
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
        removed.count++;
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
        removed.count++;
      }
    }
  }

  return removed.count;
}
