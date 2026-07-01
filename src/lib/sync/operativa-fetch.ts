import { fetchComandas } from "@/lib/comandas/comandas-service";
import { fetchPostres } from "@/lib/postres/postres-service";
import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";

export interface OperativaData {
  cocina: ComandaCocina[];
  postres: ComandaPostres[];
}

let inflight: Promise<OperativaData> | null = null;

/** Evita peticiones duplicadas concurrentes (polling + Realtime). */
export async function fetchOperativaData(): Promise<OperativaData> {
  if (!inflight) {
    inflight = Promise.all([fetchComandas(), fetchPostres()])
      .then(([cocina, postres]) => ({ cocina, postres }))
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}
