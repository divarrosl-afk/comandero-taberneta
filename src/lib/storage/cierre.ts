import { esMismaFecha } from "@/lib/cierre/fecha";
import {
  eliminarComandasDelDia,
} from "@/lib/comandas/comandas-service";
import {
  eliminarPostresDelDia,
} from "@/lib/postres/postres-service";
import { getComandasSync } from "@/lib/comandas/comandas-service";
import { getPostresSync } from "@/lib/postres/postres-service";
import { fetchOperativaData } from "@/lib/sync/operativa-fetch";
import { usesRemoteData } from "@/lib/data/backend";

export interface ResultadoBorradoDia {
  cocinaEliminadas: number;
  postresEliminados: number;
}

export async function eliminarDatosDelDia(
  fecha: string,
): Promise<ResultadoBorradoDia> {
  const cocinaEliminadas = await eliminarComandasDelDia(fecha);
  const postresEliminados = await eliminarPostresDelDia(fecha);

  if (usesRemoteData()) {
    await fetchOperativaData();
  }

  return { cocinaEliminadas, postresEliminados };
}

export function contarDatosDelDia(fecha: string): {
  cocina: number;
  postres: number;
} {
  const cocina = getComandasSync().filter((c) =>
    esMismaFecha(c.creadaEn, fecha),
  ).length;
  const postres = getPostresSync().filter((c) =>
    esMismaFecha(c.creadaEn, fecha),
  ).length;
  return { cocina, postres };
}
