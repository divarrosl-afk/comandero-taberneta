import { describe, expect, it } from "vitest";
import { comandaPostresFixture } from "../../setup/fixtures";
import { comandaPostresToTexto } from "@/lib/postres/format-ticket";

describe("comandaPostresToTexto secciones", () => {
  it("separa postres y cafés en dos bloques", () => {
    const texto = comandaPostresToTexto(
      comandaPostresFixture({
        postres: [
          { id: "p1", nombre: "Crema catalana", cantidad: 1 },
          { id: "p2", nombre: "Flan de huevo", cantidad: 1 },
        ],
        cafes: [
          { id: "c1", nombre: "C/L", cantidad: 1 },
          { id: "c2", nombre: "CARAJ DE manzanilla", cantidad: 1 },
        ],
        estadoX: null,
        estadoXCafe: null,
      }),
    );

    expect(texto).toContain("POSTRES");
    expect(texto).toContain("CREMA CATALANA");
    expect(texto).toContain("CAFES");
    expect(texto).toContain("C/L");
    expect(texto).toContain("CARAJ DE MANZANILLA");
    expect(texto.indexOf("POSTRES")).toBeLessThan(texto.indexOf("CAFES"));
  });

  it("muestra X sin café en sección cafés", () => {
    const texto = comandaPostresToTexto(
      comandaPostresFixture({
        postres: [],
        cafes: [],
        estadoX: null,
        estadoXCafe: "sin_cafe",
      }),
    );

    expect(texto).toContain("CAFES");
    expect(texto).toContain("X: SIN CAFÉ");
  });
});
