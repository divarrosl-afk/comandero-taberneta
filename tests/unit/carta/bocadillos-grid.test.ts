import { describe, expect, it } from "vitest";
import {
  agruparBocadillos,
  listaSonBocadillos,
  parseNombreBocadillo,
} from "@/lib/carta/bocadillos-grid";
import type { ProductoCatalogo } from "@/types/catalogo";

function bocadillo(
  nombre: string,
  categoria: "bocadillosCalientes" | "bocadillosFrios" = "bocadillosCalientes",
): ProductoCatalogo {
  return {
    id: nombre,
    nombre,
    seccion: "entrantes",
    tipo: "carta",
    cartaServicio: "almuerzo",
    categoriaCarta: categoria,
    usosComanda: ["entrantes"],
    precio: 3,
    activo: true,
    agotado: false,
    favorito: false,
    orden: 0,
    ingredientes: [],
    alergenos: [],
    recomendado: false,
  };
}

describe("bocadillos-grid", () => {
  it("parsea nombres medio y entero", () => {
    expect(parseNombreBocadillo("1/2 BOC Bacon")).toEqual({
      variante: "medio",
      relleno: "Bacon",
    });
    expect(parseNombreBocadillo("BOC Lomo")).toEqual({
      variante: "entero",
      relleno: "Lomo",
    });
  });

  it("agrupa medio y entero en una fila", () => {
    const filas = agruparBocadillos([
      bocadillo("1/2 BOC Bacon"),
      bocadillo("BOC Bacon"),
      bocadillo("1/2 BOC Lomo"),
      bocadillo("BOC Lomo"),
    ]);

    expect(filas).toHaveLength(2);
    expect(filas[0]?.relleno).toBe("Bacon");
    expect(filas[0]?.medio?.nombre).toBe("1/2 BOC Bacon");
    expect(filas[0]?.entero?.nombre).toBe("BOC Bacon");
  });

  it("detecta listas solo de bocadillos", () => {
    expect(
      listaSonBocadillos([
        bocadillo("1/2 BOC Bacon"),
        bocadillo("BOC Bacon"),
      ]),
    ).toBe(true);
    expect(
      listaSonBocadillos([
        bocadillo("1/2 BOC Bacon"),
        { ...bocadillo("Patatas bravas"), categoriaCarta: "tapas", nombre: "Patatas bravas" },
      ]),
    ).toBe(false);
  });
});
