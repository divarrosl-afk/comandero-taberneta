import { describe, expect, it } from "vitest";
import { CARTAS_RESTAURANTE } from "@/data/cartas-restaurante";
import { crearCatalogoDefault } from "@/data/catalogo-default";
import {
  agruparProductosPorCategoria,
  filtrarProductosComanda,
} from "@/lib/carta/carta-admin";
import { CATEGORIAS_CARTA } from "@/types/catalogo";

describe("carta almuerzo oficial", () => {
  const ordenFuente = Object.keys(CARTAS_RESTAURANTE.cartaAlmuerzo);
  const ordenAdmin = CATEGORIAS_CARTA.almuerzo.map((c) => c.id);

  it("tiene 11 categorías en el orden acordado", () => {
    expect(ordenFuente).toHaveLength(11);
    expect(ordenAdmin).toEqual(ordenFuente);
  });

  it("genera productos con variantes medio/grande y desayuno/grande", () => {
    const productos = crearCatalogoDefault();
    const alm = productos.filter((p) => p.cartaServicio === "almuerzo");

    expect(alm.some((p) => p.nombre.startsWith("1/2 BOC "))).toBe(true);
    expect(alm.some((p) => p.nombre.startsWith("BOC "))).toBe(true);
    expect(alm.some((p) => p.nombre.includes("(desayuno)"))).toBe(true);
    expect(alm.some((p) => p.nombre === "Patatas bravas")).toBe(true);
    expect(alm.some((p) => p.nombre === "Jalapeños")).toBe(true);
    expect(
      alm.find((p) => p.nombre === "Butifarra" && p.categoriaCarta === "carnesBrasa")
        ?.descripcionCamarero,
    ).toContain("Guarnición obligatoria");
  });

  it("muestra las 10 categorías de platos en entrantes, primeros y segundos", () => {
    const productos = crearCatalogoDefault();

    for (const uso of ["entrantes", "primeros", "segundos"] as const) {
      const filtrados = filtrarProductosComanda(productos, {
        uso,
        origen: "carta-almuerzo",
      });
      const grupos = agruparProductosPorCategoria(filtrados, "almuerzo");

      expect(grupos.map((g) => g.id)).toEqual([
        "tapas",
        "hamburguesas",
        "carnesGuisadas",
        "carnesBrasa",
        "ensaladas",
        "infantil",
        "bocadillosCalientes",
        "bocadillosFrios",
        "torradas",
        "platosCombinados",
      ]);
      expect(filtrados.some((p) => p.categoriaCarta === "tapas")).toBe(true);
      expect(filtrados.some((p) => p.categoriaCarta === "hamburguesas")).toBe(
        true,
      );
    }
  });
});
