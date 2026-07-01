import { describe, expect, it } from "vitest";
import { comandaToTexto } from "@/lib/comanda/format-ticket";
import { comandaPostresToTexto } from "@/lib/postres/format-ticket";
import { comandaCocinaFixture, comandaPostresFixture } from "../../setup/fixtures";

describe("format-ticket", () => {
  it("comandaToTexto incluye mesa y camarero", () => {
    const texto = comandaToTexto(comandaCocinaFixture());
    expect(texto).toContain("MESA C1");
    expect(texto).toContain("DAVID");
    expect(texto).toContain("Ensalada");
  });

  it("comandaPostresToTexto incluye postres", () => {
    const texto = comandaPostresToTexto(comandaPostresFixture());
    expect(texto).toContain("MESA C1");
    expect(texto).toContain("Flan");
  });
});
