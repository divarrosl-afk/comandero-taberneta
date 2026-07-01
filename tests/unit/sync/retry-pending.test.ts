import { describe, expect, it, vi } from "vitest";
import { comandaCocinaFixture, comandaPostresFixture } from "../../setup/fixtures";

vi.mock("@/lib/comandas/comanda-persist-meta", () => ({
  buildComandaPersistMeta: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/data/data-layer", () => ({
  getComandasRepository: vi.fn(),
  getPostresRepository: vi.fn(),
}));

vi.mock("@/lib/sync/operativa-fetch", () => ({
  fetchOperativaData: vi.fn().mockResolvedValue({ cocina: [], postres: [] }),
}));

import { getComandasRepository, getPostresRepository } from "@/lib/data/data-layer";
import {
  addPendingCocina,
  addPendingPostres,
  clearPendingSync,
} from "@/lib/sync/emergency-local";
import { retryPendingSync } from "@/lib/sync/retry-pending";

describe("retryPendingSync", () => {
  it("sube pendientes y limpia cola al tener éxito", async () => {
    const crearCocina = vi.fn().mockResolvedValue({});
    const crearPostres = vi.fn().mockResolvedValue({});
    vi.mocked(getComandasRepository).mockReturnValue({ crear: crearCocina } as never);
    vi.mocked(getPostresRepository).mockReturnValue({ crear: crearPostres } as never);

    addPendingCocina(comandaCocinaFixture({ id: "c1" }));
    addPendingPostres(comandaPostresFixture({ id: "p1" }));

    const result = await retryPendingSync();
    expect(result).toEqual({ ok: 2, fail: 0 });
    expect(crearCocina).toHaveBeenCalledOnce();
    expect(crearPostres).toHaveBeenCalledOnce();
    clearPendingSync();
  });

  it("cuenta fallos sin duplicar reintentos exitosos parciales", async () => {
    vi.mocked(getComandasRepository).mockReturnValue({
      crear: vi.fn().mockRejectedValue(new Error("red")),
    } as never);
    vi.mocked(getPostresRepository).mockReturnValue({
      crear: vi.fn().mockResolvedValue({}),
    } as never);

    addPendingCocina(comandaCocinaFixture({ id: "c-fail" }));
    addPendingPostres(comandaPostresFixture({ id: "p-ok" }));

    const result = await retryPendingSync();
    expect(result.ok).toBe(1);
    expect(result.fail).toBe(1);
  });
});
