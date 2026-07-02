import { describe, expect, it, vi, beforeEach } from "vitest";
import { comandaCocinaFixture } from "../setup/fixtures";

vi.mock("@/lib/data/data-layer", () => ({
  getComandasRepository: vi.fn(),
  getPostresRepository: vi.fn(),
}));

import { getComandasRepository, getPostresRepository } from "@/lib/data/data-layer";
import { loadOperativaMerged } from "@/lib/sync/operativa-read";
import {
  enqueueCocinaCreate,
  enqueueCocinaEstado,
  clearOutbox,
  removeOutboxForEntity,
} from "@/lib/sync/outbox";
import { saveOperativaSnapshot } from "@/lib/sync/operativa-snapshot";
import { getSyncDb } from "@/lib/sync/idb";
import { clearOperativaCache } from "@/lib/sync/operativa-cache";

async function clearSnapshotStore(): Promise<void> {
  const db = await getSyncDb();
  await db.clear("snapshot");
}

describe("loadOperativaMerged — overlay estados outbox", () => {
  beforeEach(async () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_BACKEND", "supabase");
    clearOperativaCache();
    await clearSnapshotStore();
    await clearOutbox();

    vi.mocked(getPostresRepository).mockReturnValue({
      getAll: vi.fn().mockResolvedValue([]),
    } as never);
  });

  it("remoto sentados + outbox tiene primeros → vista muestra tiene primeros", async () => {
    vi.mocked(getComandasRepository).mockReturnValue({
      getAll: vi.fn().mockResolvedValue([
        comandaCocinaFixture({ id: "r1", estadoPanel: "sentados" }),
      ]),
    } as never);

    await enqueueCocinaEstado("r1", "tiene_primeros");

    const { cocina } = await loadOperativaMerged();
    expect(cocina.find((c) => c.id === "r1")?.estadoPanel).toBe("tiene_primeros");
  });

  it("snapshot bebidas + outbox marcha segundos → vista muestra marcha segundos", async () => {
    vi.mocked(getComandasRepository).mockReturnValue({
      getAll: vi.fn().mockRejectedValue(new Error("offline")),
    } as never);

    await saveOperativaSnapshot(
      [comandaCocinaFixture({ id: "s1", estadoPanel: "bebidas" })],
      [],
    );
    await enqueueCocinaEstado("s1", "marcha_segundos");

    const { cocina } = await loadOperativaMerged();
    expect(cocina.find((c) => c.id === "s1")?.estadoPanel).toBe("marcha_segundos");
  });

  it("create sentados con estado actualizado no duplica", async () => {
    vi.mocked(getComandasRepository).mockReturnValue({
      getAll: vi.fn().mockRejectedValue(new Error("offline")),
    } as never);

    await enqueueCocinaCreate(
      comandaCocinaFixture({ id: "c-pend", estadoPanel: "sentados" }),
    );
    await enqueueCocinaEstado("c-pend", "tiene_primeros");

    const { cocina } = await loadOperativaMerged();
    const matches = cocina.filter((c) => c.id === "c-pend");
    expect(matches).toHaveLength(1);
    expect(matches[0].estadoPanel).toBe("tiene_primeros");
  });

  it("tras flush (outbox vacío) remoto vuelve a ser fuente del estado", async () => {
    vi.mocked(getComandasRepository).mockReturnValue({
      getAll: vi.fn().mockResolvedValue([
        comandaCocinaFixture({ id: "r2", estadoPanel: "sentados" }),
      ]),
    } as never);

    await enqueueCocinaEstado("r2", "tiene_primeros");
    const conOverlay = await loadOperativaMerged();
    expect(conOverlay.cocina.find((c) => c.id === "r2")?.estadoPanel).toBe(
      "tiene_primeros",
    );

    await removeOutboxForEntity(["cocina_estado"], "r2");
    const sinOverlay = await loadOperativaMerged();
    expect(sinOverlay.cocina.find((c) => c.id === "r2")?.estadoPanel).toBe(
      "sentados",
    );
  });
});
