import { loadOperativaMerged } from "@/lib/sync/operativa-read";
import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";

export interface OperativaData {
  cocina: ComandaCocina[];
  postres: ComandaPostres[];
}

let inflight: Promise<OperativaData> | null = null;
let inflightGeneration = 0;

/** Invalida peticiones en curso (p. ej. al iniciar sesión). */
export function resetOperativaInflight(): void {
  inflightGeneration += 1;
  inflight = null;
}

/** Evita peticiones duplicadas concurrentes (polling + Realtime). */
export async function fetchOperativaData(): Promise<OperativaData> {
  const generation = inflightGeneration;
  if (!inflight) {
    inflight = loadOperativaMerged()
      .then((data) => {
        if (generation !== inflightGeneration) {
          return loadOperativaMerged();
        }
        return data;
      })
      .finally(() => {
        if (generation === inflightGeneration) {
          inflight = null;
        }
      });
  }
  return inflight;
}
