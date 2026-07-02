import { normalizeEstadoPanel } from "@/types/panel";
import type { ComandaPostres } from "@/types/postres";

/** Normaliza comandas antiguas (sin cafes) y migra clH a línea de café. */
export function normalizeComandaPostres(comanda: ComandaPostres): ComandaPostres {
  let cafes = comanda.cafes ?? [];
  if (!cafes.length && comanda.clH) {
    cafes = [{ id: "legacy-clh", nombre: "C/L + H", cantidad: 1 }];
  }

  return {
    ...comanda,
    mesa: typeof comanda.mesa === "number" ? String(comanda.mesa) : comanda.mesa,
    postres: comanda.postres ?? [],
    cafes,
    observaciones: comanda.observaciones ?? [],
    estadoXCafe: comanda.estadoXCafe ?? null,
    estadoPanel: normalizeEstadoPanel(comanda.estadoPanel),
  };
}
