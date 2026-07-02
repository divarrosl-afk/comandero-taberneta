import { describe, expect, it } from "vitest";
import {
  ESTADOS_PANEL,
  isEstadoPanelActivo,
  normalizeEstadoPanel,
} from "@/types/panel";

describe("semaforo panel", () => {
  it("normaliza estados legacy", () => {
    expect(normalizeEstadoPanel("pendiente")).toBe("sentados");
    expect(normalizeEstadoPanel("en_preparacion")).toBe("bebidas");
    expect(normalizeEstadoPanel("listo")).toBe("tiene_primeros");
    expect(normalizeEstadoPanel("servido")).toBe("marcha_segundos");
  });

  it("tiene el flujo completo de marcha", () => {
    expect(ESTADOS_PANEL.map((e) => e.id)).toEqual([
      "sentados",
      "bebidas",
      "tapas",
      "marcha_1",
      "tiene_primeros",
      "marcha_segundos",
      "segundos",
      "marcha_postres",
      "tiene_postres",
      "marcha_cafes",
      "tiene_cafes",
      "marcha_cuenta",
      "mesa_libre",
    ]);
  });

  it("oculta comandas en mesa libre del panel activo", () => {
    expect(isEstadoPanelActivo("marcha_segundos")).toBe(true);
    expect(isEstadoPanelActivo("mesa_libre")).toBe(false);
  });
});
