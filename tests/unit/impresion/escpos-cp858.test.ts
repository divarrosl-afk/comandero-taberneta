import { describe, expect, it } from "vitest";
import { encodeToCp858 } from "@/lib/impresion/escpos-cp858";

describe("escpos-cp858", () => {
  it("codifica ASCII sin cambios", () => {
    const buf = encodeToCp858("Mesa C1");
    expect(buf.toString("latin1")).toBe("Mesa C1");
  });

  it("codifica acentos latinos", () => {
    const buf = encodeToCp858("añádido");
    expect(buf.length).toBeGreaterThan(0);
    expect(buf.includes(0x3f)).toBe(false);
  });
});
