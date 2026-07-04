import { buildComandaPersistMeta } from "@/lib/comandas/comanda-persist-meta";
import { getComandasRepository, getPostresRepository } from "@/lib/data/data-layer";
import { usesRemoteData } from "@/lib/data/backend";
import { getSupabaseAccessToken } from "@/lib/supabase/client";
import { isDuplicateKeyError } from "@/lib/supabase/errors";
import {
  incrementOutboxRetry,
  listOutboxEntries,
  removeOutboxForEntity,
} from "@/lib/sync/outbox";
import type { OutboxEntry } from "@/lib/sync/outbox-types";
import { reconcileOutbox, isOutboxEntryActionable } from "@/lib/sync/reconcile-outbox";
import { loadOperativaMerged } from "@/lib/sync/operativa-read";
import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";
import type { EstadoPanel } from "@/types/panel";

const BASE_BACKOFF_MS = 2000;

export interface FlushResult {
  ok: number;
  fail: number;
}

let flushing = false;

function backoffMs(retries: number): number {
  return Math.min(BASE_BACKOFF_MS * 2 ** retries, 60_000);
}

function shouldSkip(entry: OutboxEntry): boolean {
  return !isOutboxEntryActionable(entry);
}

async function executeEntry(entry: OutboxEntry): Promise<void> {
  switch (entry.kind) {
    case "cocina_create": {
      const comanda = entry.payload as ComandaCocina;
      const meta = await buildComandaPersistMeta(comanda.mesa, null);
      try {
        await getComandasRepository().crear(comanda, meta);
      } catch (e) {
        if (!isDuplicateKeyError(e)) throw e;
      }
      await removeOutboxForEntity(["cocina_create", "cocina_estado"], comanda.id);
      return;
    }
    case "postres_create": {
      const comanda = entry.payload as ComandaPostres;
      const meta = await buildComandaPersistMeta(comanda.mesa, null);
      try {
        await getPostresRepository().crear(comanda, meta);
      } catch (e) {
        if (!isDuplicateKeyError(e)) throw e;
      }
      await removeOutboxForEntity(
        ["postres_create", "postres_estado"],
        comanda.id,
      );
      return;
    }
    case "cocina_estado": {
      const { estado } = entry.payload as { estado: EstadoPanel };
      const updated = await getComandasRepository().actualizarEstado(
        entry.entityId,
        estado,
      );
      if (!updated) {
        const remota = await getComandasRepository().getById(entry.entityId);
        if (
          remota &&
          remota.estadoPanel === estado
        ) {
          await removeOutboxForEntity(["cocina_estado"], entry.entityId);
          return;
        }
        throw new Error("No se pudo actualizar estado cocina");
      }
      await removeOutboxForEntity(["cocina_estado"], entry.entityId);
      return;
    }
    case "postres_estado": {
      const { estado } = entry.payload as { estado: EstadoPanel };
      const updated = await getPostresRepository().actualizarEstado(
        entry.entityId,
        estado,
      );
      if (!updated) {
        const remota = await getPostresRepository().getById(entry.entityId);
        if (
          remota &&
          remota.estadoPanel === estado
        ) {
          await removeOutboxForEntity(["postres_estado"], entry.entityId);
          return;
        }
        throw new Error("No se pudo actualizar estado postres");
      }
      await removeOutboxForEntity(["postres_estado"], entry.entityId);
      return;
    }
    default:
      return;
  }
}

/** Procesa la cola outbox (idempotente por entity id). */
export async function flushOutbox(): Promise<FlushResult> {
  if (!usesRemoteData() || typeof window === "undefined") {
    return { ok: 0, fail: 0 };
  }
  if (flushing) return { ok: 0, fail: 0 };
  if (!navigator.onLine) return { ok: 0, fail: 0 };

  flushing = true;
  let ok = 0;
  let fail = 0;

  try {
    const token = await getSupabaseAccessToken();
    if (!token) return { ok: 0, fail: 0 };

    await reconcileOutbox();
    const entries = await listOutboxEntries();
    for (const entry of entries) {
      if (shouldSkip(entry)) {
        continue;
      }
      try {
        await executeEntry(entry);
        ok++;
      } catch {
        await incrementOutboxRetry(entry.opId);
        fail++;
      }
    }
    await loadOperativaMerged();
  } finally {
    flushing = false;
  }

  return { ok, fail };
}

export function isOutboxFlushing(): boolean {
  return flushing;
}
