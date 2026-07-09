import { describe, expect, it } from "vitest";
import {
  cantidadModificacion,
  normalizarModificaciones,
  tapModificacionEnLista,
} from "@/lib/comanda/modificaciones";

describe("modificaciones", () => {
  it("normaliza formato antiguo string[]", () => {
    expect(normalizarModificaciones(["huevo", "queso"])).toEqual([
      { id: "huevo", cantidad: 1 },
      { id: "queso", cantidad: 1 },
    ]);
  });

  it("cuenta cantidad por id", () => {
    const mods = [
      { id: "huevo" as const, cantidad: 2 },
      { id: "queso" as const, cantidad: 1 },
    ];
    expect(cantidadModificacion(mods, "huevo")).toBe(2);
    expect(cantidadModificacion(mods, "mong")).toBe(0);
  });

  it("cicla cantidad x1 → x2 → x3 en toques", () => {
    let mods = tapModificacionEnLista([], "huevo");
    expect(mods).toEqual([{ id: "huevo", cantidad: 1 }]);

    mods = tapModificacionEnLista(mods, "huevo");
    expect(mods).toEqual([{ id: "huevo", cantidad: 2 }]);

    mods = tapModificacionEnLista(mods, "huevo");
    expect(mods).toEqual([{ id: "huevo", cantidad: 3 }]);

    mods = tapModificacionEnLista(mods, "huevo");
    expect(mods).toEqual([{ id: "huevo", cantidad: 3 }]);
  });

  it("toggle mods activan y desactivan", () => {
    let mods = tapModificacionEnLista([], "urgente");
    expect(mods).toEqual([{ id: "urgente", cantidad: 1 }]);
    mods = tapModificacionEnLista(mods, "urgente");
    expect(mods).toEqual([]);
  });
});
