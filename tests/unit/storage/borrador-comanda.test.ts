import { describe, expect, it } from "vitest";
import { normalizarBorrador } from "@/lib/storage/borrador-comanda";
import { crearPlatoVacio } from "@/lib/comanda/plato-factory";

describe("normalizarBorrador", () => {
  it("añade extras vacío si falta en borrador antiguo", () => {
    const normalizado = normalizarBorrador({
      mesa: "5",
      camareroId: null,
      entrantes: [crearPlatoVacio()],
      primeros: [crearPlatoVacio()],
      segundos: [crearPlatoVacio()],
      bebidas: [crearPlatoVacio()],
      observaciones: [""],
    });

    expect(normalizado.extras).toEqual([]);
  });

  it("conserva extras con cantidad", () => {
    const normalizado = normalizarBorrador({
      mesa: "8",
      extras: [{ id: "vasos", nombre: "Vasos", cantidad: 2 }],
    });

    expect(normalizado.extras).toEqual([
      { id: "vasos", nombre: "Vasos", cantidad: 2 },
    ]);
  });
});
