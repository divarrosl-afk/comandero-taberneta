import { describe, expect, it, vi, beforeEach } from "vitest";
import { comandaCocinaFixture, comandaPostresFixture } from "../../setup/fixtures";

vi.mock("@/lib/comandas/comanda-persist-meta", () => ({
  buildComandaPersistMeta: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/data/data-layer", () => ({
  getComandasRepository: vi.fn(),
  getPostresRepository: vi.fn(),
}));

vi.mock("@/lib/sync/operativa-read", () => ({
  loadOperativaMerged: vi.fn().mockResolvedValue({ cocina: [], postres: [] }),
}));

import { getComandasRepository, getPostresRepository } from "@/lib/data/data-layer";
import { enqueueCocinaCreate, enqueuePostresCreate, clearOutbox } from "@/lib/sync/outbox";
import { retryPendingSync } from "@/lib/sync/retry-pending";

describe("retryPendingSync", () => {
  beforeEach(async () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_BACKEND", "supabase");
    await clearOutbox();
    vi.stubGlobal("navigator", { onLine: true });
  });

  it("delega en flushOutbox", async () => {
    const crearCocina = vi.fn().mockResolvedValue({});
    const crearPostres = vi.fn().mockResolvedValue({});
    vi.mocked(getComandasRepository).mockReturnValue({
      crear: crearCocina,
      getById: vi.fn().mockResolvedValue(null),
    } as never);
    vi.mocked(getPostresRepository).mockReturnValue({
      crear: crearPostres,
      getById: vi.fn().mockResolvedValue(null),
    } as never);

    await enqueueCocinaCreate(comandaCocinaFixture({ id: "c1" }));
    await enqueuePostresCreate(comandaPostresFixture({ id: "p1" }));

    const result = await retryPendingSync();
    expect(result.ok).toBe(2);
    expect(crearCocina).toHaveBeenCalledOnce();
    expect(crearPostres).toHaveBeenCalledOnce();
  });
});
