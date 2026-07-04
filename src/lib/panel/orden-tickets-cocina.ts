import type { ComandaCocina } from "@/types/comanda";
import { indiceEstadoPanel, type EstadoPanel } from "@/types/panel";

export type RielCocina = "primeros" | "segundos";

/** Primeros = hasta antes de marcha segundos; segundos = marcha segundos en adelante. */
export function rielCocinaComanda(estado: EstadoPanel): RielCocina {
  const idx = indiceEstadoPanel(estado);
  const umbral = indiceEstadoPanel("marcha_segundos");
  return idx < umbral ? "primeros" : "segundos";
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
} {
  const primeros: ComandaCocina[] = [];
  const segundos: ComandaCocina[] = [];

  for (const comanda of comandas) {
    if (rielCocinaComanda(comanda.estadoPanel) === "primeros") {
      primeros.push(comanda);
    } else {
      segundos.push(comanda);
    }
  }

  return {
    primeros: ordenarComandasPorLlegada(primeros),
    segundos: ordenarComandasPorLlegada(segundos),
  };
}
