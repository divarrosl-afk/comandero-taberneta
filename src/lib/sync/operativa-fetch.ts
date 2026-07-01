import { loadOperativaMerged } from "@/lib/sync/operativa-read";
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
    inflight = loadOperativaMerged().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}
