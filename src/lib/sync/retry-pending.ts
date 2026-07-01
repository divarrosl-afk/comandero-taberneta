import { buildComandaPersistMeta } from "@/lib/comandas/comanda-persist-meta";
import { fetchComandas } from "@/lib/comandas/comandas-service";
import { fetchPostres } from "@/lib/postres/postres-service";
import { getComandasRepository, getPostresRepository } from "@/lib/data/data-layer";
import {
  getPendingCocina,
  getPendingPostres,
  removePendingCocina,
  removePendingPostres,
} from "@/lib/sync/emergency-local";

export interface RetrySyncResult {
  ok: number;
  fail: number;
}

/** Reintenta subir comandas/postres pendientes sin duplicar (mismo id). */
export async function retryPendingSync(): Promise<RetrySyncResult> {
  let ok = 0;
  let fail = 0;

  for (const comanda of [...getPendingCocina()]) {
    try {
      const meta = await buildComandaPersistMeta(comanda.mesa, null);
      await getComandasRepository().crear(comanda, meta);
      removePendingCocina(comanda.id);
      ok++;
    } catch {
      fail++;
    }
  }

  for (const comanda of [...getPendingPostres()]) {
    try {
      const meta = await buildComandaPersistMeta(comanda.mesa, null);
      await getPostresRepository().crear(comanda, meta);
      removePendingPostres(comanda.id);
      ok++;
    } catch {
      fail++;
    }
  }

  await Promise.all([fetchComandas(), fetchPostres()]);
  return { ok, fail };
}
