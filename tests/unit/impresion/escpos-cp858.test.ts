import { describe, expect, it } from "vitest";
import { encodeToCp858 } from "@/lib/impresion/escpos-cp858";

describe("escpos-cp858", () => {
  it("codifica ASCII sin cambios", () => {
    const buf = encodeToCp858("Mesa C1");
    expect(buf.toString("latin1")).toBe("Mesa C1");
  });

  it("codifica acentos españoles a bytes CP858 correctos", () => {
    expect(encodeToCp858("á")[0]).toBe(0xa0);
    expect(encodeToCp858("é")[0]).toBe(0x82);
    expect(encodeToCp858("í")[0]).toBe(0xa1);
    expect(encodeToCp858("ó")[0]).toBe(0xa2);
    expect(encodeToCp858("ú")[0]).toBe(0xa3);
    expect(encodeToCp858("ñ")[0]).toBe(0xa4);
    expect(encodeToCp858("Ñ")[0]).toBe(0xa5);
    expect(encodeToCp858("Á")[0]).toBe(0xb5);
  });

  it("codifica frase con acentos sin perder caracteres", () => {
    const buf = encodeToCp858("SIN LÁCTOSA · MUY HECHO");
    expect(buf.includes(0x3f)).toBe(false);
    expect(buf.length).toBeGreaterThan(10);
  });

  it("codifica euro", () => {
    const buf = encodeToCp858("24,50 €");
    expect(buf.includes(0xd5)).toBe(true);
  });
});
