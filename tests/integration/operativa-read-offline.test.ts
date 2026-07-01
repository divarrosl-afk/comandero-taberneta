import { describe, expect, it, vi, beforeEach } from "vitest";
import { comandaCocinaFixture } from "../setup/fixtures";

vi.mock("@/lib/data/data-layer", () => ({
  getComandasRepository: vi.fn(() => ({
    getAll: vi.fn().mockRejectedValue(new Error("offline")),
  })),
  getPostresRepository: vi.fn(() => ({
    getAll: vi.fn().mockRejectedValue(new Error("offline")),
  })),
}));

import { saveOperativaSnapshot } from "@/lib/sync/operativa-snapshot";
import { loadOperativaMerged } from "@/lib/sync/operativa-read";
import { enqueueCocinaCreate, clearOutbox } from "@/lib/sync/outbox";
import { getSyncDb } from "@/lib/sync/idb";
import { setComandasCache, clearOperativaCache } from "@/lib/sync/operativa-cache";

async function clearSnapshotStore(): Promise<void> {
  const db = await getSyncDb();
  await db.clear("snapshot");
}

describe("loadOperativaMerged offline", () => {
  beforeEach(async () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_BACKEND", "supabase");
    clearOperativaCache();
    await clearSnapshotStore();
    await clearOutbox();
  });

  it("sirve snapshot + outbox si remoto falla", async () => {
    await saveOperativaSnapshot(
      [comandaCocinaFixture({ id: "snap-1" })],
      [],
    );
    await enqueueCocinaCreate(comandaCocinaFixture({ id: "pending-1" }));

    const { cocina } = await loadOperativaMerged();
    const ids = cocina.map((c) => c.id);
    expect(ids).toContain("snap-1");
    expect(ids).toContain("pending-1");
  });

  it("usa caché RAM si no hay snapshot ni remoto", async () => {
    setComandasCache([comandaCocinaFixture({ id: "cache-1" })]);

    const { cocina } = await loadOperativaMerged();
    expect(cocina.map((c) => c.id)).toContain("cache-1");
  });

  it("no duplica create pendiente tras merge con remoto vacío", async () => {
    await saveOperativaSnapshot([], []);
    await enqueueCocinaCreate(comandaCocinaFixture({ id: "dup-1" }));

    const first = await loadOperativaMerged();
    const second = await loadOperativaMerged();

    expect(first.cocina.filter((c) => c.id === "dup-1")).toHaveLength(1);
    expect(second.cocina.filter((c) => c.id === "dup-1")).toHaveLength(1);
  });
});
