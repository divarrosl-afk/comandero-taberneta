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
  it("clasifica riel primeros, segundos y postres", () => {
    expect(rielCocinaComanda("marcha_1")).toBe("primeros");
    expect(rielCocinaComanda("tiene_primeros")).toBe("segundos");
    expect(rielCocinaComanda("marcha_segundos")).toBe("segundos");
    expect(rielCocinaComanda("segundos")).toBe("postres");
    expect(rielCocinaComanda("marcha_postres")).toBe("postres");
  });

  it("ordena por llegada (más antiguo primero)", () => {
    const ordenadas = ordenarComandasPorLlegada([
      comanda("b", "2026-07-04T12:00:00Z", "sentados"),
      comanda("a", "2026-07-04T11:00:00Z", "sentados"),
    ]);
    expect(ordenadas.map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("agrupa en tres rieles ordenados", () => {
    const { primeros, segundos, postres } = agruparComandasEnRieles([
      comanda("p2", "2026-07-04T12:00:00Z", "marcha_1"),
      comanda("p1", "2026-07-04T11:00:00Z", "bebidas"),
      comanda("s1", "2026-07-04T11:30:00Z", "tiene_primeros"),
      comanda("s2", "2026-07-04T12:15:00Z", "marcha_segundos"),
      comanda("po1", "2026-07-04T12:30:00Z", "segundos"),
    ]);

    expect(primeros.map((c) => c.id)).toEqual(["p1", "p2"]);
    expect(segundos.map((c) => c.id)).toEqual(["s1", "s2"]);
    expect(postres.map((c) => c.id)).toEqual(["po1"]);
  });
});
