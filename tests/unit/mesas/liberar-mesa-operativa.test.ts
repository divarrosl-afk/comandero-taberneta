import { beforeEach, describe, expect, it, vi } from "vitest";
import { comandaCocinaFixture, comandaPostresFixture } from "../../setup/fixtures";

vi.mock("@/lib/comandas/comandas-service", () => ({
  getComandasSync: vi.fn(),
  actualizarEstadoComanda: vi.fn(),
}));
vi.mock("@/lib/postres/postres-service", () => ({
  getPostresSync: vi.fn(),
  actualizarEstadoPostres: vi.fn(),
}));

import {
  actualizarEstadoComanda,
  getComandasSync,
} from "@/lib/comandas/comandas-service";
import {
  actualizarEstadoPostres,
  getPostresSync,
} from "@/lib/postres/postres-service";
import { getEstadoMesa } from "@/lib/mesas/estado-mesa";
import { liberarMesaOperativa } from "@/lib/mesas/liberar-mesa-operativa";

describe("liberarMesaOperativa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(actualizarEstadoComanda).mockResolvedValue(null);
    vi.mocked(actualizarEstadoPostres).mockResolvedValue(null);
  });

  it("marca comandas activas como mesa_libre y libera la mesa", async () => {
    vi.mocked(getComandasSync).mockReturnValue([
      comandaCocinaFixture({ id: "c1", mesa: "TV", estadoPanel: "segundos" }),
      comandaCocinaFixture({ id: "c2", mesa: "TV", estadoPanel: "mesa_libre" }),
    ]);
    vi.mocked(getPostresSync).mockReturnValue([
      comandaPostresFixture({ id: "p1", mesa: "TV", estadoPanel: "tiene_postres" }),
    ]);

    await liberarMesaOperativa("TV");

    expect(actualizarEstadoComanda).toHaveBeenCalledWith("c1", "mesa_libre");
    expect(actualizarEstadoComanda).toHaveBeenCalledTimes(1);
    expect(actualizarEstadoPostres).toHaveBeenCalledWith("p1", "mesa_libre");
    expect(actualizarEstadoPostres).toHaveBeenCalledTimes(1);
    expect(getEstadoMesa("TV")).toBe("libre");
  });

  it("libera la mesa aunque no haya comandas activas", async () => {
    vi.mocked(getComandasSync).mockReturnValue([]);
    vi.mocked(getPostresSync).mockReturnValue([]);

    await liberarMesaOperativa("C1");

    expect(actualizarEstadoComanda).not.toHaveBeenCalled();
    expect(actualizarEstadoPostres).not.toHaveBeenCalled();
    expect(getEstadoMesa("C1")).toBe("libre");
  });
});
