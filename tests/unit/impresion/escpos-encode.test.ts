import { describe, expect, it } from "vitest";
import {
  ADVANCED_TEST_TICKET_TEXT,
  buildAdvancedTestTicketBuffer,
  buildEscPosBuffer,
  buildTestTicketBuffer,
  charsPerLine,
  encodePlainTicket,
  wrapLine,
} from "@/lib/impresion/escpos-encode";
import { encodeToCp858 } from "@/lib/impresion/escpos-cp858";

describe("escpos-encode", () => {
  it("calcula ancho 48 para 80mm", () => {
    expect(charsPerLine("80mm")).toBe(48);
    expect(charsPerLine("58mm")).toBe(32);
  });

  it("inicializa con ESC @ y selecciona CP858", () => {
    const buf = encodePlainTicket("Hola", "80mm");
    expect(buf[0]).toBe(0x1b);
    expect(buf[1]).toBe(0x40);
    expect(buf[2]).toBe(0x1b);
    expect(buf[3]).toBe(0x74);
    expect(buf[4]).toBe(19);
    expect(buf.toString("latin1")).toContain("Hola");
  });

  it("codifica euro en CP858", () => {
    const buf = encodeToCp858("24,50 €");
    expect(buf.includes(0xd5)).toBe(true);
  });

  it("ticket de prueba incluye LA TABERNETA", () => {
    const buf = buildTestTicketBuffer();
    expect(buf.toString("latin1")).toContain("LA TABERNETA");
    expect(buf.toString("latin1")).toContain("TEST IMPRESORA");
  });

  it("ticket avanzado incluye líneas de comanda simuladas", () => {
    const buf = buildAdvancedTestTicketBuffer();
    const text = buf.toString("latin1");
    expect(text).toContain("Hamburguesa Angus");
    expect(text).toContain("Sin cebolla");
    expect(text).toContain("24,50");
    expect(ADVANCED_TEST_TICKET_TEXT).toContain("Mesa C1");
  });

  it("normaliza separadores a 48 iguales en 80mm", () => {
    const buf = buildEscPosBuffer("================================\n", "80mm");
    const text = buf.toString("latin1");
    const matches = text.match(/={48}/);
    expect(matches).not.toBeNull();
  });

  it("envuelve líneas largas a 48 caracteres", () => {
    const long = "A".repeat(60);
    const wrapped = wrapLine(long, 48);
    expect(wrapped.length).toBeGreaterThan(1);
    expect(wrapped.every((l) => l.length <= 48)).toBe(true);
  });

  it("aplica doble tamaño en líneas de plato marcadas", () => {
    const buf = buildEscPosBuffer("@D@(M) GAZPACHO\n", "80mm");
    const gsIdx = buf.indexOf(0x1d);
    expect(buf[gsIdx + 2]).toBe(0x11);
    expect(buf.toString("latin1")).toContain("GAZPACHO");
  });

  it("aplica doble alto en especificaciones marcadas", () => {
    const buf = buildEscPosBuffer("@M@ - MUY HECHO\n", "80mm");
    const gsIdx = buf.indexOf(0x1d);
    expect(buf[gsIdx + 2]).toBe(0x01);
    expect(buf.toString("latin1")).toContain("MUY HECHO");
  });

  it("termina con corte parcial GS V tras líneas de avance", () => {
    const buf = buildTestTicketBuffer();
    expect(buf.includes(0x1d)).toBe(true);
    const gsIndex = buf.lastIndexOf(0x1d);
    expect(buf[gsIndex + 1]).toBe(0x56);
    expect(buf[gsIndex + 2]).toBe(0x42);
    expect(buf[gsIndex + 3]).toBe(5);
  });
});
