import { describe, expect, it } from "vitest";
import { comandaCocinaFixture } from "../../setup/fixtures";
import { lineasMarchaCocina } from "@/lib/panel/resumen-marcha";

describe("resumen-marcha", () => {
  it("muestra bebidas en fase bebidas", () => {
    const comanda = comandaCocinaFixture({
      bebidas: [
        {
          id: "b1",
          nombre: "Refresco",
          cantidad: 2,
          modificaciones: [],
          salsas: [],
          estado: "pendiente",
        },
      ],
    });
    const lineas = lineasMarchaCocina(comanda, "bebidas");
    expect(lineas[0]).toContain("Refresco");
  });

  it("muestra segundos en fase marcha segundos", () => {
    const comanda = comandaCocinaFixture({
      segundos: [
        {
          id: "s1",
          nombre: "Cordero",
          cantidad: 1,
          modificaciones: [],
          salsas: [],
          estado: "pendiente",
        },
      ],
    });
    const lineas = lineasMarchaCocina(comanda, "marcha_segundos");
    expect(lineas[0]).toBe("Cordero");
  });
});
