import { describe, expect, it } from "vitest";
import { esMismaFechaRestaurante, fechaDeIsoEnZona } from "@/lib/cierre/fecha";

describe("fecha restaurante", () => {
  it("agrupa por día Europe/Madrid", () => {
    expect(
      fechaDeIsoEnZona("2026-07-01T22:30:00.000Z", "Europe/Madrid"),
    ).toBe("2026-07-02");
    expect(
      esMismaFechaRestaurante("2026-07-01T22:30:00.000Z", "2026-07-02"),
    ).toBe(true);
  });
});
