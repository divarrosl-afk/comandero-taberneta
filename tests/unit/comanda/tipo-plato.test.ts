import { describe, expect, it } from "vitest";
import {
  etiquetaTipoPlato,
  tipoSeleccionToPlatoFields,
} from "@/lib/comanda/tipo-plato";

describe("tipo-plato", () => {
  it("mapea 1/2 menú", () => {
    expect(tipoSeleccionToPlatoFields("menu_medio")).toEqual({
      tipo: "menu_medio",
    });
    expect(etiquetaTipoPlato("menu_medio")).toEqual(["1/2 MENÚ"]);
  });
});
