import { describe, expect, it } from "vitest";
import {
  agruparComandasEnRieles,
  ordenarComandasPorLlegada,
  rielCocinaComanda,
} from "@/lib/panel/orden-tickets-cocina";
import type { ComandaCocina } from "@/types/comanda";

function comanda(
  id: string,
  creadaEn: string,
  estadoPanel: ComandaCocina["estadoPanel"],
): ComandaCocina {
  return {
    id,
    mesa: "m1",
    camarero: "Test",
    tipoServicio: "mesa",
    entrantes: [],
    primeros: [],
    segundos: [],
    bebidas: [],
    extras: [],
    observaciones: [],
    creadaEn,
    enviada: true,
    estadoPanel,
  };
}

describe("orden-tickets-cocina", () => {
  it("clasifica riel primeros y segundos", () => {
    expect(rielCocinaComanda("tiene_primeros")).toBe("primeros");
    expect(rielCocinaComanda("marcha_segundos")).toBe("segundos");
    expect(rielCocinaComanda("segundos")).toBe("segundos");
  });

  it("ordena por llegada (más antiguo primero)", () => {
    const ordenadas = ordenarComandasPorLlegada([
      comanda("b", "2026-07-04T12:00:00Z", "sentados"),
      comanda("a", "2026-07-04T11:00:00Z", "sentados"),
    ]);
    expect(ordenadas.map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("agrupa en dos rieles ordenados", () => {
    const { primeros, segundos } = agruparComandasEnRieles([
      comanda("p2", "2026-07-04T12:00:00Z", "marcha_1"),
      comanda("p1", "2026-07-04T11:00:00Z", "bebidas"),
      comanda("s2", "2026-07-04T13:00:00Z", "segundos"),
      comanda("s1", "2026-07-04T11:30:00Z", "marcha_segundos"),
    ]);

    expect(primeros.map((c) => c.id)).toEqual(["p1", "p2"]);
    expect(segundos.map((c) => c.id)).toEqual(["s1", "s2"]);
  });
});
