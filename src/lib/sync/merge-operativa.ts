/** Une remoto + pendientes locales sin duplicar por id (gana remoto). */
export function mergeOperativa<T extends { id: string; creadaEn: string }>(
  remoto: T[],
  pendientes: T[],
): T[] {
  const idsRemotos = new Set(remoto.map((r) => r.id));
  const soloPendientes = pendientes.filter((p) => !idsRemotos.has(p.id));
  return [...soloPendientes, ...remoto].sort(
    (a, b) =>
      new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime(),
  );
}

/** Comandas en caché local aún no visibles en remoto/outbox (p. ej. recién guardadas). */
export function mergeOptimisticCache<T extends { id: string; creadaEn: string }>(
  merged: T[],
  cache: T[],
): T[] {
  const known = new Set(merged.map((item) => item.id));
  const soloCache = cache.filter((item) => !known.has(item.id));
  if (soloCache.length === 0) return merged;
  return mergeOperativa(merged, soloCache);
}
