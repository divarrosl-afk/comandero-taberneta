import { mergeOperativa } from "@/lib/sync/merge-operativa";

/** Merge remoto + pendientes; si falla remoto, conserva pendientes sin vaciar caché operativa. */
export async function mergeOperativaSafe<T extends { id: string; creadaEn: string }>(
  loadRemoto: () => Promise<T[]>,
  getPendientes: () => T[],
  setCache: (merged: T[]) => void,
): Promise<T[]> {
  let remoto: T[] = [];
  try {
    remoto = await loadRemoto();
  } catch {
    remoto = [];
  }
  const merged = mergeOperativa(remoto, getPendientes());
  setCache(merged);
  return merged;
}
