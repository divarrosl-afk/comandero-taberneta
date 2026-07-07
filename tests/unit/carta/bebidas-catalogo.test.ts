import { describe, expect, it } from "vitest";
import { crearCatalogoCartas } from "@/data/cartas-catalogo";
import { CATEGORIAS_CARTA } from "@/types/catalogo";

describe("catálogo bebidas", () => {
  const bebidas = crearCatalogoCartas().filter((p) => p.seccion === "bebidas");

  it("incluye categorías Refrescos y Cervezas como primeras en bebidas", () => {
    expect(CATEGORIAS_CARTA.bebidas.slice(0, 2).map((c) => c.id)).toEqual([
      "refrescos",
      "cervezas",
    ]);
  });

  it("tiene todos los refrescos solicitados", () => {
    const refrescos = bebidas.filter((p) => p.categoriaCarta === "refrescos");
    expect(refrescos).toHaveLength(24);
    expect(refrescos.map((p) => p.nombre)).toContain("Zumo natural");
    expect(refrescos.map((p) => p.nombre)).toContain("Cacaolat");
    expect(refrescos.map((p) => p.nombre)).toContain("ColaCao");
  });

  it("tiene todos los productos de cervezas/barra solicitados", () => {
    const cervezas = bebidas.filter((p) => p.categoriaCarta === "cervezas");
    expect(cervezas).toHaveLength(24);
    expect(cervezas.map((p) => p.nombre)).toContain("Quinto DAMM");
    expect(cervezas.map((p) => p.nombre)).toContain("Copa blanco Verdejo");
    expect(cervezas.map((p) => p.nombre)).toContain("Chupito crema orujo");
  });
});
