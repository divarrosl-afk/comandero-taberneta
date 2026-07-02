import { describe, expect, it, vi } from "vitest";
import { comandaCocinaFixture, comandaPostresFixture } from "../../setup/fixtures";

vi.mock("@/lib/comandas/comandas-service", () => ({
  getComandasSync: vi.fn(),
}));
vi.mock("@/lib/postres/postres-service", () => ({
  getPostresSync: vi.fn(),
}));

import { getComandasSync } from "@/lib/comandas/comandas-service";
import { getPostresSync } from "@/lib/postres/postres-service";
import {
  getEstadoMesa,
  getEstadoPanelMesa,
  liberarMesa,
  marcarMesaCobrando,
  notificarComandaEnviada,
} from "@/lib/mesas/estado-mesa";

describe("estado-mesa", () => {
  it("calcula pendiente si hay comanda activa", () => {
    vi.mocked(getComandasSync).mockReturnValue([
      comandaCocinaFixture({ mesa: "C1", estadoPanel: "bebidas" }),
    ]);
    vi.mocked(getPostresSync).mockReturnValue([]);
    expect(getEstadoMesa("C1")).toBe("pendiente");
  });

  it("mesa libre sin comandas", () => {
    vi.mocked(getComandasSync).mockReturnValue([]);
    vi.mocked(getPostresSync).mockReturnValue([]);
    expect(getEstadoMesa("C9")).toBe("libre");
  });

  it("estado manual cobrando prevalece", () => {
    vi.mocked(getComandasSync).mockReturnValue([
      comandaCocinaFixture({ mesa: "C1", estadoPanel: "sentados" }),
    ]);
    vi.mocked(getPostresSync).mockReturnValue([]);
    marcarMesaCobrando("C1");
    expect(getEstadoMesa("C1")).toBe("cobrando");
    liberarMesa("C1");
    expect(getEstadoMesa("C1")).toBe("libre");
  });

  it("cobrando manual no se sobreescribe al notificar envío", () => {
    vi.mocked(getComandasSync).mockReturnValue([]);
    vi.mocked(getPostresSync).mockReturnValue([]);
    marcarMesaCobrando("C2");
    notificarComandaEnviada("C2");
    expect(getEstadoMesa("C2")).toBe("cobrando");
  });

  it("pendiente cuando hay comanda activa en mesa", () => {
    vi.mocked(getComandasSync).mockReturnValue([
      comandaCocinaFixture({ mesa: "C2", estadoPanel: "sentados" }),
    ]);
    vi.mocked(getPostresSync).mockReturnValue([]);
    expect(getEstadoMesa("C2")).toBe("pendiente");
  });

  it("servida cuando todas las comandas están en marcha cuenta", () => {
    vi.mocked(getComandasSync).mockReturnValue([
      comandaCocinaFixture({ mesa: "C3", estadoPanel: "marcha_cuenta" }),
    ]);
    vi.mocked(getPostresSync).mockReturnValue([
      comandaPostresFixture({ mesa: "C3", estadoPanel: "marcha_cuenta" }),
    ]);
    expect(getEstadoMesa("C3")).toBe("servida");
  });

  it("getEstadoPanelMesa devuelve fase cocina en vez de pendiente", () => {
    vi.mocked(getComandasSync).mockReturnValue([
      comandaCocinaFixture({ mesa: "C1", estadoPanel: "marcha_cafes" }),
    ]);
    vi.mocked(getPostresSync).mockReturnValue([]);
    expect(getEstadoPanelMesa("C1")).toBe("marcha_cafes");
  });

  it("getEstadoPanelMesa prioriza cocina sobre postres", () => {
    vi.mocked(getComandasSync).mockReturnValue([
      comandaCocinaFixture({ mesa: "C4", estadoPanel: "marcha_segundos" }),
    ]);
    vi.mocked(getPostresSync).mockReturnValue([
      comandaPostresFixture({ mesa: "C4", estadoPanel: "tiene_postres" }),
    ]);
    expect(getEstadoPanelMesa("C4")).toBe("marcha_segundos");
  });

  it("getEstadoPanelMesa null si cobrando manual", () => {
    vi.mocked(getComandasSync).mockReturnValue([
      comandaCocinaFixture({ mesa: "C5", estadoPanel: "bebidas" }),
    ]);
    vi.mocked(getPostresSync).mockReturnValue([]);
    marcarMesaCobrando("C5");
    expect(getEstadoPanelMesa("C5")).toBeNull();
  });
});
