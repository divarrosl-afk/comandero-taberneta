import { getComandasRepository, getPostresRepository } from "@/lib/data/data-layer";
import { usesRemoteData } from "@/lib/data/backend";
import { getSupabaseAccessToken } from "@/lib/supabase/client";
import { mergeOperativa, mergeOptimisticCache } from "@/lib/sync/merge-operativa";
import {
  getOutboxPendingCocinaSync,
  getOutboxPendingPostresSync,
  hydrateOutboxMirror,
  listOutboxEntries,
} from "@/lib/sync/outbox";
import type { OutboxEntry } from "@/lib/sync/outbox-types";
import {
  loadOperativaSnapshot,
  saveOperativaSnapshot,
} from "@/lib/sync/operativa-snapshot";
import {
  getComandasCache,
  getPostresCache,
  setComandasCache,
  setPostresCache,
} from "@/lib/sync/operativa-cache";
import { reconcileOutbox, isOutboxEntryActionable } from "@/lib/sync/reconcile-outbox";
import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";
import type { EstadoPanel } from "@/types/panel";

export interface OperativaData {
  cocina: ComandaCocina[];
  postres: ComandaPostres[];
}

async function fetchRemoto(): Promise<OperativaData | null> {
  if (usesRemoteData()) {
    const token = await getSupabaseAccessToken();
    if (!token) return null;
  }

  try {
    const [cocina, postres] = await Promise.all([
      getComandasRepository().getAll(),
      getPostresRepository().getAll(),
    ]);
    return { cocina, postres };
  } catch {
    return null;
  }
}

/** Overlay last-write-wins de estados pendientes en outbox (por entityId). */
export function buildEstadoOverlayFromOutbox(
  entries: OutboxEntry[],
  estadoKind: "cocina_estado" | "postres_estado",
  createKind: "cocina_create" | "postres_create",
): Map<string, EstadoPanel> {
  const overlay = new Map<string, EstadoPanel>();
  const sorted = [...entries]
    .filter(isOutboxEntryActionable)
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  for (const entry of sorted) {
    if (entry.kind === estadoKind) {
      overlay.set(
        entry.entityId,
        (entry.payload as { estado: EstadoPanel }).estado,
      );
    } else if (entry.kind === createKind) {
      const item = entry.payload as { id: string; estadoPanel: EstadoPanel };
      overlay.set(entry.entityId, item.estadoPanel);
    }
  }

  return overlay;
}

export function applyEstadoOverlay<T extends { id: string; estadoPanel: EstadoPanel }>(
  items: T[],
  overlay: Map<string, EstadoPanel>,
): T[] {
  if (overlay.size === 0) return items;

  return items.map((item) => {
    const estado = overlay.get(item.id);
    return estado === undefined ? item : { ...item, estadoPanel: estado };
  });
}

function overlayPendingEstados<T extends { id: string; estadoPanel: EstadoPanel }>(
  items: T[],
  entries: OutboxEntry[],
  estadoKind: "cocina_estado" | "postres_estado",
  createKind: "cocina_create" | "postres_create",
): T[] {
  const overlay = buildEstadoOverlayFromOutbox(entries, estadoKind, createKind);
  return applyEstadoOverlay(items, overlay);
}

/**
 * Carga operativa: Supabase es fuente de verdad cuando hay red.
 * Solo fusiona creates pendientes aún no confirmados en servidor.
 */
export async function loadOperativaMerged(): Promise<OperativaData> {
  if (!usesRemoteData()) {
    const [cocina, postres] = await Promise.all([
      getComandasRepository().getAll(),
      getPostresRepository().getAll(),
    ]);
    setComandasCache(cocina);
    setPostresCache(postres);
    return { cocina, postres };
  }

  await hydrateOutboxMirror();
  await reconcileOutbox();

  const pendingCocina = getOutboxPendingCocinaSync();
  const pendingPostres = getOutboxPendingPostresSync();

  const remoto = await fetchRemoto();
  let baseCocina: ComandaCocina[];
  let basePostres: ComandaPostres[];

  if (remoto) {
    baseCocina = remoto.cocina;
    basePostres = remoto.postres;
  } else {
    const snap = await loadOperativaSnapshot();
    baseCocina = snap?.cocina ?? getComandasCache();
    basePostres = snap?.postres ?? getPostresCache();
  }

  const cocinaMerged = mergeOptimisticCache(
    mergeOperativa(baseCocina, pendingCocina),
    getComandasCache(),
  );
  const postresMerged = mergeOptimisticCache(
    mergeOperativa(basePostres, pendingPostres),
    getPostresCache(),
  );

  let cocina = cocinaMerged;
  let postres = postresMerged;

  if (!remoto) {
    const outboxEntries = await listOutboxEntries();
    cocina = overlayPendingEstados(
      cocinaMerged,
      outboxEntries,
      "cocina_estado",
      "cocina_create",
    );
    postres = overlayPendingEstados(
      postresMerged,
      outboxEntries,
      "postres_estado",
      "postres_create",
    );
  }

  setComandasCache(cocina);
  setPostresCache(postres);

  if (remoto) {
    await saveOperativaSnapshot(cocina, postres);
  } else if (!usesRemoteData()) {
    await saveOperativaSnapshot(cocina, postres);
  }

  return { cocina, postres };
}

export function patchCocinaInCache(
  id: string,
  patch: Partial<ComandaCocina>,
): ComandaCocina | null {
  const items = getComandasCache();
  const idx = items.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const updated = { ...items[idx], ...patch };
  const next = [...items];
  next[idx] = updated;
  setComandasCache(next);
  void saveOperativaSnapshot(next, getPostresCache());
  return updated;
}

export function patchPostresInCache(
  id: string,
  patch: Partial<ComandaPostres>,
): ComandaPostres | null {
  const items = getPostresCache();
  const idx = items.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const updated = { ...items[idx], ...patch };
  const next = [...items];
  next[idx] = updated;
  setPostresCache(next);
  void saveOperativaSnapshot(getComandasCache(), next);
  return updated;
}
