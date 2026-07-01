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
