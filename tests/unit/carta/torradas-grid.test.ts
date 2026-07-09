import { describe, expect, it } from "vitest";
import {
  agruparTorradas,
  formatoTorradaCarta,
  formatoTorradaDesayuno,
  listaUsaGridTorradas,
  normalizarNombreTorrada,
  parseNombreTorrada,
  rellenoTorrada,
} from "@/lib/carta/torradas-grid";
import type { ProductoCatalogo } from "@/types/catalogo";

function torrada(
  nombre: string,
): ProductoCatalogo {
  return {
    id: nombre,
    nombre,
    seccion: "entrantes",
    tipo: "carta",
    cartaServicio: "almuerzo",
    categoriaCarta: "torradas",
    usosComanda: ["entrantes"],
    precio: 10,
    activo: true,
    agotado: false,
    favorito: false,
    orden: 0,
    ingredientes: [],
    alergenos: [],
    recomendado: false,
  };
}

describe("torradas-grid", () => {
  it("genera nombres TORRA DESAYUNO DE y TORRA CARTA DE", () => {
    expect(formatoTorradaDesayuno("Butifarra con queso")).toBe(
      "TORRA DESAYUNO DE Butifarra con queso",
    );
    expect(formatoTorradaCarta("Butifarra con queso")).toBe(
      "TORRA CARTA DE Butifarra con queso",
    );
    expect(rellenoTorrada("Torrada de jamón ibérico")).toBe("jamón ibérico");
  });

  it("parsea nombres nuevos y legacy", () => {
    expect(parseNombreTorrada("TORRA DESAYUNO DE Bacon y queso")).toEqual({
      variante: "desayuno",
      relleno: "Bacon y queso",
    });
    expect(parseNombreTorrada("TORRA CARTA DE Bacon y queso")).toEqual({
      variante: "carta",
      relleno: "Bacon y queso",
    });
    expect(
      parseNombreTorrada(
        "Torrada Butifarra con queso, cebolla y pimiento verde (grande)",
      ),
    ).toEqual({
      variante: "carta",
      relleno: "Butifarra con queso, cebolla y pimiento verde",
    });
  });

  it("normaliza legacy a formato TORRA", () => {
    expect(
      normalizarNombreTorrada(
        "Torrada Escalivada, atún, anchoas y olivas (grande)",
      ),
    ).toBe("TORRA CARTA DE Escalivada, atún, anchoas y olivas");
  });

  it("agrupa desayuno y carta en una fila", () => {
    const filas = agruparTorradas([
      torrada("TORRA DESAYUNO DE Bacon y queso"),
      torrada("TORRA CARTA DE Bacon y queso"),
    ]);
    expect(filas).toHaveLength(1);
    expect(filas[0]?.desayuno?.nombre).toContain("DESAYUNO");
    expect(filas[0]?.carta?.nombre).toContain("CARTA");
  });

  it("detecta listas de torradas con variantes", () => {
    expect(
      listaUsaGridTorradas([
        torrada("TORRA DESAYUNO DE Bacon y queso"),
        torrada("TORRA CARTA DE Bacon y queso"),
      ]),
    ).toBe(true);
  });
});
