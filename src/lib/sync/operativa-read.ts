import { getComandasRepository, getPostresRepository } from "@/lib/data/data-layer";
import { usesRemoteData } from "@/lib/data/backend";
import { mergeOperativa } from "@/lib/sync/merge-operativa";
import {
  getOutboxPendingCocinaSync,
  getOutboxPendingPostresSync,
} from "@/lib/sync/outbox";
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
import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";

export interface OperativaData {
  cocina: ComandaCocina[];
  postres: ComandaPostres[];
}

async function fetchRemoto(): Promise<OperativaData | null> {
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

/** Carga operativa: remoto → snapshot IDB → outbox. Persiste snapshot si remoto OK. */
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

  const cocina = mergeOperativa(baseCocina, pendingCocina);
  const postres = mergeOperativa(basePostres, pendingPostres);

  setComandasCache(cocina);
  setPostresCache(postres);

  if (remoto) {
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
