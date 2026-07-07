import { describe, expect, it } from "vitest";
import { normalizarListaPostreForm } from "@/lib/postres/normalize-form-item";
import { postreTieneContenido } from "@/lib/postres/postre-factory";

describe("normalize-form-item", () => {
  it("repara items corruptos del borrador sin romper render", () => {
    const lista = normalizarListaPostreForm([
      { id: "c1", cantidad: 2 } as { id: string; nombre?: string; cantidad: number },
      null,
    ]);

    expect(lista).toHaveLength(2);
    expect(lista[0]?.nombre).toBe("");
    expect(lista[0]?.cantidad).toBe(2);
    expect(lista[0]?.id).toBe("c1");
    expect(postreTieneContenido(lista[0]!)).toBe(false);
    expect(lista[1]?.id).toBeTruthy();
  });
});
