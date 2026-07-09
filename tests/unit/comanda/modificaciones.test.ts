import { describe, expect, it } from "vitest";
import {
  cantidadModificacion,
  normalizarModificaciones,
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
});
