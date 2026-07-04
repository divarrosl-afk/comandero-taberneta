import type { ComandaCocina } from "@/types/comanda";
import { indiceEstadoPanel, type EstadoPanel } from "@/types/panel";

export type RielCocina = "primeros" | "segundos" | "postres";

/**
 * Primeros: hasta antes de marcha segundos.
 * Segundos: solo marcha segundos (cocinando 2º).
 * Postres: tiene segundos (estado segundos) y fases posteriores.
 */
export function rielCocinaComanda(estado: EstadoPanel): RielCocina {
  const idx = indiceEstadoPanel(estado);
  const marchaSegundos = indiceEstadoPanel("marcha_segundos");
  const segundos = indiceEstadoPanel("segundos");

  if (idx < marchaSegundos) return "primeros";
  if (idx < segundos) return "segundos";
  return "postres";
}

export function ordenarComandasPorLlegada<T extends { creadaEn: string }>(
  comandas: T[],
): T[] {
  return [...comandas].sort(
    (a, b) => new Date(a.creadaEn).getTime() - new Date(b.creadaEn).getTime(),
  );
}

export function minutosEspera(creadaEn: string, ahora = Date.now()): number {
  const ms = ahora - new Date(creadaEn).getTime();
  return Math.max(0, Math.floor(ms / 60_000));
}

export function agruparComandasEnRieles(comandas: ComandaCocina[]): {
  primeros: ComandaCocina[];
  segundos: ComandaCocina[];
  postres: ComandaCocina[];
} {
  const primeros: ComandaCocina[] = [];
  const segundos: ComandaCocina[] = [];
  const postres: ComandaCocina[] = [];

  for (const comanda of comandas) {
    const riel = rielCocinaComanda(comanda.estadoPanel);
    if (riel === "primeros") primeros.push(comanda);
    else if (riel === "segundos") segundos.push(comanda);
    else postres.push(comanda);
  }

  return {
    primeros: ordenarComandasPorLlegada(primeros),
    segundos: ordenarComandasPorLlegada(segundos),
    postres: ordenarComandasPorLlegada(postres),
  };
}
