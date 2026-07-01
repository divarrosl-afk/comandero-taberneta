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
  liberarMesa,
  marcarMesaCobrando,
  notificarComandaEnviada,
} from "@/lib/mesas/estado-mesa";

describe("estado-mesa", () => {
  it("calcula pendiente si hay comanda activa", () => {
    vi.mocked(getComandasSync).mockReturnValue([
      comandaCocinaFixture({ mesa: "C1", estadoPanel: "en_preparacion" }),
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
      comandaCocinaFixture({ mesa: "C1", estadoPanel: "pendiente" }),
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
      comandaCocinaFixture({ mesa: "C2", estadoPanel: "pendiente" }),
    ]);
    vi.mocked(getPostresSync).mockReturnValue([]);
    expect(getEstadoMesa("C2")).toBe("pendiente");
  });

  it("servida cuando todas las comandas están servidas", () => {
    vi.mocked(getComandasSync).mockReturnValue([
      comandaCocinaFixture({ mesa: "C3", estadoPanel: "servido" }),
    ]);
    vi.mocked(getPostresSync).mockReturnValue([
      comandaPostresFixture({ mesa: "C3", estadoPanel: "servido" }),
    ]);
    expect(getEstadoMesa("C3")).toBe("servida");
  });
});
