import {
  getComandasCocinaFiltradas,
  getComandasPostresFiltradas,
} from "@/lib/cierre/filtros";
import type { PlatoComanda } from "@/types/comanda";
import type {
  ConteoItem,
  FiltrosCierre,
  ResumenCierre,
} from "@/types/cierre";
import type { EstadoPanel } from "@/types/panel";
import type { ComandaPostres } from "@/types/postres";

const ESTADOS_VACIOS: Record<EstadoPanel, number> = {
  pendiente: 0,
  en_preparacion: 0,
  listo: 0,
  servido: 0,
};

function acumularPlatos(
  mapa: Map<string, number>,
  platos: PlatoComanda[],
): void {
  for (const p of platos) {
    const nombre = p.nombre.trim();
    if (!nombre) continue;
    mapa.set(nombre, (mapa.get(nombre) ?? 0) + p.cantidad);
  }
}

function topItems(mapa: Map<string, number>, limite = 10): ConteoItem[] {
  return [...mapa.entries()]
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre, "es"))
    .slice(0, limite);
}

function acumularPostres(
  mapa: Map<string, number>,
  comandas: ComandaPostres[],
): void {
  for (const c of comandas) {
    for (const p of c.postres) {
      const nombre = p.nombre.trim();
      if (!nombre) continue;
      mapa.set(nombre, (mapa.get(nombre) ?? 0) + p.cantidad);
    }
  }
}

export function calcularResumenCierre(filtros: FiltrosCierre): ResumenCierre {
  const cocina = getComandasCocinaFiltradas(filtros);
  const postres = getComandasPostresFiltradas(filtros);

  const porCamarero = new Map<string, number>();
  const porMesa = new Map<number, number>();
  const porEstado: Record<EstadoPanel, number> = { ...ESTADOS_VACIOS };

  const platosMap = new Map<string, number>();
  const bebidasMap = new Map<string, number>();
  const postresMap = new Map<string, number>();

  for (const c of cocina) {
    porCamarero.set(c.camarero, (porCamarero.get(c.camarero) ?? 0) + 1);
    porMesa.set(c.mesa, (porMesa.get(c.mesa) ?? 0) + 1);
    porEstado[c.estadoPanel]++;

    acumularPlatos(platosMap, c.entrantes);
    acumularPlatos(platosMap, c.primeros);
    acumularPlatos(platosMap, c.segundos);
    acumularPlatos(bebidasMap, c.bebidas);
  }

  for (const c of postres) {
    porCamarero.set(c.camarero, (porCamarero.get(c.camarero) ?? 0) + 1);
    porMesa.set(c.mesa, (porMesa.get(c.mesa) ?? 0) + 1);
    porEstado[c.estadoPanel]++;
  }

  acumularPostres(postresMap, postres);

  return {
    totalCocina: cocina.length,
    totalPostres: postres.length,
    totalTickets: cocina.length + postres.length,
    porCamarero: [...porCamarero.entries()]
      .map(([camarero, cantidad]) => ({ camarero, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad),
    porMesa: [...porMesa.entries()]
      .map(([mesa, cantidad]) => ({ mesa, cantidad }))
      .sort((a, b) => a.mesa - b.mesa),
    platosMasPedidos: topItems(platosMap),
    bebidasMasPedidas: topItems(bebidasMap),
    postresMasPedidos: topItems(postresMap),
    porEstado,
  };
}
