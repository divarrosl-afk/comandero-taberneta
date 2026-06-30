import { esMismaFecha } from "@/lib/cierre/fecha";
import { getComandasLocales } from "@/lib/storage/comandas-local";
import { getPostresLocales } from "@/lib/storage/postres-local";

const COMANDAS_KEY = "comandero-taberneta:comandas";
const POSTRES_KEY = "comandero-taberneta:postres";

export interface ResultadoBorradoDia {
  cocinaEliminadas: number;
  postresEliminados: number;
}

export function eliminarDatosDelDia(fecha: string): ResultadoBorradoDia {
  if (typeof window === "undefined") {
    return { cocinaEliminadas: 0, postresEliminados: 0 };
  }

  const comandas = getComandasLocales();
  const restantesCocina = comandas.filter(
    (c) => !esMismaFecha(c.creadaEn, fecha),
  );
  const cocinaEliminadas = comandas.length - restantesCocina.length;

  const postres = getPostresLocales();
  const restantesPostres = postres.filter(
    (c) => !esMismaFecha(c.creadaEn, fecha),
  );
  const postresEliminados = postres.length - restantesPostres.length;

  if (cocinaEliminadas > 0) {
    localStorage.setItem(COMANDAS_KEY, JSON.stringify(restantesCocina));
  }
  if (postresEliminados > 0) {
    localStorage.setItem(POSTRES_KEY, JSON.stringify(restantesPostres));
  }

  return { cocinaEliminadas, postresEliminados };
}

export function contarDatosDelDia(fecha: string): {
  cocina: number;
  postres: number;
} {
  const cocina = getComandasLocales().filter((c) =>
    esMismaFecha(c.creadaEn, fecha),
  ).length;
  const postres = getPostresLocales().filter((c) =>
    esMismaFecha(c.creadaEn, fecha),
  ).length;
  return { cocina, postres };
}
