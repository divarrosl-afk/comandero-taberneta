import { describe, expect, it, vi } from "vitest";
import { FECHA_HOY, comandaCocinaFixture, comandaPostresFixture } from "../../setup/fixtures";

vi.mock("@/lib/comandas/comandas-service", () => ({
  getComandasSync: vi.fn(),
}));
vi.mock("@/lib/postres/postres-service", () => ({
  getPostresSync: vi.fn(),
}));

import { getComandasSync } from "@/lib/comandas/comandas-service";
import { getPostresSync } from "@/lib/postres/postres-service";
import { calcularResumenCierre } from "@/lib/cierre/metricas";
import { FILTRO_TODOS_CAMARERO } from "@/types/cierre";

describe("calcularResumenCierre", () => {
  it("calcula totales y platos más pedidos", () => {
    vi.mocked(getComandasSync).mockReturnValue([
      comandaCocinaFixture({ id: "c1", creadaEn: `${FECHA_HOY}T10:00:00Z` }),
    ]);
    vi.mocked(getPostresSync).mockReturnValue([
      comandaPostresFixture({ id: "p1", creadaEn: `${FECHA_HOY}T11:00:00Z` }),
    ]);

    const resumen = calcularResumenCierre({
      fecha: FECHA_HOY,
      camarero: FILTRO_TODOS_CAMARERO,
      mesa: null,
      tipo: "todos",
      estado: "todos",
    });

    expect(resumen.totalCocina).toBe(1);
    expect(resumen.totalPostres).toBe(1);
    expect(resumen.totalTickets).toBe(2);
    expect(resumen.platosMasPedidos[0]?.nombre).toBe("Ensalada");
    expect(resumen.postresMasPedidos[0]?.nombre).toBe("Flan");
  });
});
