import { describe, expect, it } from "vitest";
import {
  charsPerLine,
  encodeTicket,
} from "../../../print-server/lib/escpos.js";

describe("ESC/POS encode", () => {
  it("calcula ancho por papel", () => {
    expect(charsPerLine("58mm")).toBe(32);
    expect(charsPerLine("80mm")).toBe(48);
  });

  it("genera bytes con init y corte", () => {
    const buf = encodeTicket("Hola\nMundo", "80mm");
    expect(buf[0]).toBe(0x1b);
    expect(buf[1]).toBe(0x40);
    expect(buf.includes(0x1d)).toBe(true);
    expect(buf.toString("latin1")).toContain("Hola");
  });

  it("envuelve líneas largas", () => {
    const long = "A".repeat(60);
    const buf = encodeTicket(long, "58mm");
    const text = buf.toString("latin1");
    const lines = text.split("\n").filter((l) => l.includes("A"));
    expect(lines.length).toBeGreaterThan(1);
  });
});
