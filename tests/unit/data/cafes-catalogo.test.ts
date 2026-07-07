import { describe, expect, it } from "vitest";
import {
  crearProductosCafesCatalogo,
  etiquetaCarajillo,
  etiquetaTicketDeProductoCafe,
} from "@/data/cafes-catalogo";
import { productoParaUsoComanda } from "@/lib/carta/carta-admin";

describe("cafes-catalogo", () => {
  it("crea productos por categoría", () => {
    const productos = crearProductosCafesCatalogo();
    expect(productos.some((p) => p.categoriaCarta === "cafes")).toBe(true);
    expect(productos.some((p) => p.categoriaCarta === "carajillos")).toBe(true);
    expect(productos.some((p) => p.categoriaCarta === "infusiones")).toBe(true);
    expect(productos.every((p) => p.usosComanda?.length === 0)).toBe(true);
  });

  it("genera etiqueta de ticket para carajillo", () => {
    const carajillo = crearProductosCafesCatalogo().find(
      (p) => p.categoriaCarta === "carajillos",
    );
    expect(carajillo).toBeDefined();
    expect(etiquetaTicketDeProductoCafe(carajillo!)).toBe(
      etiquetaCarajillo(carajillo!.nombre),
    );
  });

  it("productos de café no aparecen en uso postres", () => {
    const cafe = crearProductosCafesCatalogo()[0];
    expect(productoParaUsoComanda(cafe, "postres")).toBe(false);
  });
});
