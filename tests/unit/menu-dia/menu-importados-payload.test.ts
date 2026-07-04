import { describe, expect, it } from "vitest";
import {
  attachMenuImportPayload,
  isMissingImportColumnsError,
  stripMenuImportPayload,
} from "@/lib/menu-dia/menu-importados-payload";

describe("menu-importados-payload", () => {
  it("detecta error de columnas faltantes", () => {
    expect(
      isMissingImportColumnsError(
        "Could not find the 'primeros_importados' column of 'menus_dia' in the schema cache",
      ),
    ).toBe(true);
  });

  it("guarda y recupera platos en observaciones", () => {
    const encoded = attachMenuImportPayload("Pan y postre incluidos", {
      primerosImportados: [{ id: "p1", nombre: "Gazpacho" }],
      segundosImportados: [{ id: "s1", nombre: "Butifarra" }],
    });

    const { observacionesVisibles, payload } = stripMenuImportPayload(encoded);
    expect(observacionesVisibles).toBe("Pan y postre incluidos");
    expect(payload?.primerosImportados?.[0]?.nombre).toBe("Gazpacho");
    expect(payload?.segundosImportados?.[0]?.nombre).toBe("Butifarra");
  });
});
