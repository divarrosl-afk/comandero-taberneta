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
import { enqueueCocinaCreate } from "@/lib/sync/outbox";

describe("loadOperativaMerged offline", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_DATA_BACKEND", "supabase");
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
});
