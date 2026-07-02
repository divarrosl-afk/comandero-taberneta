import { describe, expect, it } from "vitest";
import { crearCatalogoDefault } from "@/data/catalogo-default";
import { migrarProducto } from "@/lib/carta/migrate-producto";
import {
  agruparProductosPorCategoria,
  filtrarProductosComanda,
} from "@/lib/carta/carta-admin";

describe("filtrarProductosComanda carta completa", () => {
  const productos = crearCatalogoDefault();

  it("muestra toda la carta almuerzo en primeros y segundos", () => {
    for (const uso of ["primeros", "segundos"] as const) {
      const filtrados = filtrarProductosComanda(productos, {
        uso,
        origen: "carta-almuerzo",
      });
      const grupos = agruparProductosPorCategoria(filtrados, "almuerzo");

      expect(filtrados.some((p) => p.categoriaCarta === "tapas")).toBe(true);
      expect(filtrados.some((p) => p.categoriaCarta === "ensaladas")).toBe(true);
      expect(grupos.length).toBeGreaterThanOrEqual(10);
    }
  });

  it("muestra toda la carta almuerzo en entrantes", () => {
    const filtrados = filtrarProductosComanda(productos, {
      uso: "entrantes",
      origen: "carta-almuerzo",
    });

    expect(filtrados.some((p) => p.categoriaCarta === "tapas")).toBe(true);
    expect(filtrados.some((p) => p.categoriaCarta === "hamburguesas")).toBe(
      true,
    );
  });

  it("enriquece productos antiguos sin metadatos de carta", () => {
    const bravas = productos.find(
      (p) => p.nombre.toLowerCase().includes("bravas") && p.cartaServicio === "almuerzo",
    );
    expect(bravas).toBeDefined();

    const legacy = migrarProducto({
      id: "legacy-1",
      nombre: bravas!.nombre,
      seccion: "primeros",
      tipo: "carta",
      precio: bravas!.precioCarta,
      activo: true,
      agotado: false,
      favorito: false,
      orden: 0,
      ingredientes: [],
      alergenos: [],
      recomendado: false,
    });

    expect(legacy.cartaServicio).toBe("almuerzo");
    expect(legacy.categoriaCarta).toBe(bravas!.categoriaCarta);

    const filtrados = filtrarProductosComanda([legacy], {
      uso: "primeros",
      origen: "carta-almuerzo",
    });
    expect(filtrados).toHaveLength(1);
  });
});
