import { describe, expect, it } from "vitest";
import {
  buscarEnCatalogo,
  coincideAbreviatura,
  normalizarTexto,
  parsearFiltroAlergeno,
} from "@/lib/catalogo/search";
import { productoCatalogoFixture } from "../../setup/fixtures";

describe("catalogo search", () => {
  const productos = [
    productoCatalogoFixture({ id: "1", nombre: "Bacalao", seccion: "primeros" }),
    productoCatalogoFixture({ id: "2", nombre: "Ensalada", seccion: "entrantes", activo: false }),
    productoCatalogoFixture({
      id: "3",
      nombre: "Tarta sin gluten",
      seccion: "postres",
      alergenos: [],
    }),
  ];

  it("normaliza texto sin acentos", () => {
    expect(normalizarTexto("Café")).toBe("cafe");
  });

  it("coincide abreviatura baca → Bacalao", () => {
    expect(coincideAbreviatura("Bacalao", "baca")).toBe(true);
  });

  it("buscarEnCatalogo filtra por nombre", () => {
    const result = buscarEnCatalogo(productos, "bacal", { soloActivos: true });
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe("Bacalao");
  });

  it("parsearFiltroAlergeno sin gluten", () => {
    const f = parsearFiltroAlergeno("sin gluten");
    expect(f?.tipo).toBe("sin");
    expect(f?.alergeno).toBe("gluten");
  });
});
