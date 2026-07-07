import { describe, expect, it } from "vitest";
import { hrefCamareroAcceso } from "@/lib/navigation/camarero-accesos";

describe("camarero-accesos", () => {
  it("genera hrefs con y sin mesa", () => {
    expect(hrefCamareroAcceso("mes")).toBe("/mesas");
    expect(hrefCamareroAcceso("nota")).toBe("/comanda/nueva");
    expect(hrefCamareroAcceso("nota", "C1")).toBe(
      "/comanda/nueva?mesa=C1",
    );
    expect(hrefCamareroAcceso("post", "TV")).toBe("/postres/nuevo?mesa=TV");
    expect(hrefCamareroAcceso("pc")).toBe("/panel?tab=cocina");
    expect(hrefCamareroAcceso("pc", "B3")).toBe("/panel?tab=cocina");
  });
});
