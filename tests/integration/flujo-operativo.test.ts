import { describe, expect, it } from "vitest";
import { initializeDataLayer } from "@/lib/data/data-layer";
import {
  actualizarEstadoComanda,
  getComandasSync,
  guardarComanda,
} from "@/lib/comandas/comandas-service";
import {
  actualizarEstadoPostres,
  getPostresSync,
  guardarPostres,
} from "@/lib/postres/postres-service";
import { getHistorialEntradas } from "@/lib/historial/items";
import { calcularResumenCierre } from "@/lib/cierre/metricas";
import { FILTRO_TODOS_CAMARERO } from "@/types/cierre";
import {
  comandaCocinaFixture,
  comandaPostresFixture,
  FECHA_HOY,
} from "../setup/fixtures";

describe("flujo operativo local (integración)", () => {
  it("crear comanda → panel → cambiar estado → historial → cierre", async () => {
    initializeDataLayer();

    const cocina = comandaCocinaFixture({ id: "flow-c1" });
    await guardarComanda(cocina);

    const panelCocina = getComandasSync();
    expect(panelCocina.some((c) => c.id === "flow-c1")).toBe(true);

    await actualizarEstadoComanda("flow-c1", "bebidas");
    expect(getComandasSync().find((c) => c.id === "flow-c1")?.estadoPanel).toBe(
      "bebidas",
    );

    const postres = comandaPostresFixture({ id: "flow-p1" });
    await guardarPostres(postres);
    expect(getPostresSync().some((p) => p.id === "flow-p1")).toBe(true);

    await actualizarEstadoPostres("flow-p1", "tiene_primeros");
    expect(getPostresSync().find((p) => p.id === "flow-p1")?.estadoPanel).toBe(
      "tiene_primeros",
    );

    const historial = getHistorialEntradas();
    expect(historial.some((e) => e.comanda.id === "flow-c1")).toBe(true);
    expect(historial.some((e) => e.comanda.id === "flow-p1")).toBe(true);

    const resumen = calcularResumenCierre({
      fecha: FECHA_HOY,
      camarero: FILTRO_TODOS_CAMARERO,
      mesa: null,
      tipo: "todos",
      estado: "todos",
    });
    expect(resumen.totalTickets).toBeGreaterThanOrEqual(2);
  });
});
