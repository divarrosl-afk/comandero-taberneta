import { describe, expect, it } from "vitest";
import { esMismaFecha, fechaDeIso, hoyFecha } from "@/lib/cierre/fecha";

describe("cierre fecha", () => {
  it("fechaDeIso extrae YYYY-MM-DD local", () => {
    expect(fechaDeIso("2025-06-15T22:30:00.000Z")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("esMismaFecha compara día calendario", () => {
    expect(esMismaFecha("2025-06-15T08:00:00Z", "2025-06-15")).toBe(true);
    expect(esMismaFecha("2025-06-15T08:00:00Z", "2025-06-16")).toBe(false);
  });

  it("hoyFecha tiene formato válido", () => {
    expect(hoyFecha()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
