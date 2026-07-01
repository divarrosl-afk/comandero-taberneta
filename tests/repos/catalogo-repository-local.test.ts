import { describe, expect, it } from "vitest";
import { catalogoRepositoryLocal } from "@/lib/catalogo/catalogo-repository-local";

describe("catalogoRepositoryLocal", () => {
  it("getAll devuelve productos", async () => {
    const productos = await catalogoRepositoryLocal.getAll();
    expect(productos.length).toBeGreaterThan(0);
  });

  it("getBySeccion filtra", async () => {
    const bebidas = await catalogoRepositoryLocal.getBySeccion("bebidas");
    expect(bebidas.every((p) => p.seccion === "bebidas")).toBe(true);
  });
});
