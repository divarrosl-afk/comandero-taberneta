import { esMismaFecha } from "@/lib/cierre/fecha";
import { getComandasSync } from "@/lib/comandas/comandas-service";
import { getPostresSync } from "@/lib/postres/postres-service";
import type { ComandaCocina } from "@/types/comanda";
import type { EntradaCierre, FiltrosCierre } from "@/types/cierre";
import type { ComandaPostres } from "@/types/postres";

function cocinaAEntrada(c: ComandaCocina): EntradaCierre {
  return {
    tipo: "cocina",
    id: c.id,
    mesa: c.mesa,
    camarero: c.camarero,
    creadaEn: c.creadaEn,
    estadoPanel: c.estadoPanel,
  };
}

function postresAEntrada(c: ComandaPostres): EntradaCierre {
  return {
    tipo: "postres",
    id: c.id,
    mesa: c.mesa,
    camarero: c.camarero,
    creadaEn: c.creadaEn,
    estadoPanel: c.estadoPanel,
  };
}

export function getEntradasDelDia(fecha: string): EntradaCierre[] {
  const cocina = getComandasSync()
    .filter((c) => esMismaFecha(c.creadaEn, fecha))
    .map(cocinaAEntrada);
  const postres = getPostresSync()
    .filter((c) => esMismaFecha(c.creadaEn, fecha))
    .map(postresAEntrada);

  return [...cocina, ...postres].sort(
    (a, b) => new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime(),
  );
}

export function filtrarEntradas(
  entradas: EntradaCierre[],
  filtros: FiltrosCierre,
): EntradaCierre[] {
  return entradas.filter((e) => {
    if (!esMismaFecha(e.creadaEn, filtros.fecha)) return false;
    if (filtros.tipo !== "todos" && e.tipo !== filtros.tipo) return false;
    if (
      filtros.camarero !== "todos" &&
      e.camarero !== filtros.camarero
    ) {
      return false;
    }
    if (filtros.mesa !== null && e.mesa !== filtros.mesa) return false;
    if (filtros.estado !== "todos" && e.estadoPanel !== filtros.estado) {
      return false;
    }
    return true;
  });
}

export function getComandasCocinaFiltradas(
  filtros: FiltrosCierre,
): ComandaCocina[] {
  const ids = new Set(
    filtrarEntradas(getEntradasDelDia(filtros.fecha), filtros)
      .filter((e) => e.tipo === "cocina")
      .map((e) => e.id),
  );
  return getComandasSync().filter((c) => ids.has(c.id));
}

export function getComandasPostresFiltradas(
  filtros: FiltrosCierre,
): ComandaPostres[] {
  const ids = new Set(
    filtrarEntradas(getEntradasDelDia(filtros.fecha), filtros)
      .filter((e) => e.tipo === "postres")
      .map((e) => e.id),
  );
  return getPostresSync().filter((c) => ids.has(c.id));
}

export function getCamarerosDelDia(fecha: string): string[] {
  const set = new Set<string>();
  for (const e of getEntradasDelDia(fecha)) {
    set.add(e.camarero);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "es"));
}

export function getMesasDelDia(fecha: string): string[] {
  const set = new Set<string>();
  for (const e of getEntradasDelDia(fecha)) {
    set.add(e.mesa);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "es"));
}
