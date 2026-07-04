import { esMismaFechaRestaurante } from "@/lib/cierre/fecha";
import {
  asegurarDiaFueraDeCache,
  purgarOperativaLocalDelDia,
} from "@/lib/cierre/purge-dia";
import { getComandasSync } from "@/lib/comandas/comandas-service";
import { getPostresSync } from "@/lib/postres/postres-service";
import { usesRemoteData } from "@/lib/data/backend";
import { getSupabaseAccessToken } from "@/lib/supabase/client";
import { fetchOperativaData } from "@/lib/sync/operativa-fetch";

export interface ResultadoBorradoDia {
  cocinaEliminadas: number;
  postresEliminados: number;
}

async function borrarRemotoAdmin(fecha: string): Promise<{
  cocina: number;
  postres: number;
}> {
  const token = await getSupabaseAccessToken();
  if (!token) return { cocina: 0, postres: 0 };

  try {
    const response = await fetch("/api/admin/cierre/borrar-dia", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fecha }),
    });

    const data = (await response.json()) as {
      cocinaEliminadas?: number;
      postresEliminados?: number;
    };

    if (!response.ok) return { cocina: 0, postres: 0 };

    return {
      cocina: data.cocinaEliminadas ?? 0,
      postres: data.postresEliminados ?? 0,
    };
  } catch {
    return { cocina: 0, postres: 0 };
  }
}

export async function eliminarDatosDelDia(
  fecha: string,
): Promise<ResultadoBorradoDia> {
  const local = await purgarOperativaLocalDelDia(fecha);

  let cocinaRemoto = 0;
  let postresRemoto = 0;

  if (usesRemoteData()) {
    const remoto = await borrarRemotoAdmin(fecha);
    cocinaRemoto = remoto.cocina;
    postresRemoto = remoto.postres;

    try {
      await fetchOperativaData();
    } catch {
      // La purga local ya actualizó la UI
    }

    asegurarDiaFueraDeCache(fecha);
  }

  return {
    cocinaEliminadas: Math.max(local.cocina, cocinaRemoto),
    postresEliminados: Math.max(local.postres, postresRemoto),
  };
}

export function contarDatosDelDia(fecha: string): {
  cocina: number;
  postres: number;
} {
  const cocina = getComandasSync().filter((c) =>
    esMismaFechaRestaurante(c.creadaEn, fecha),
  ).length;
  const postres = getPostresSync().filter((c) =>
    esMismaFechaRestaurante(c.creadaEn, fecha),
  ).length;
  return { cocina, postres };
}
