import { describe, expect, it, vi, beforeEach } from "vitest";
import { comandaCocinaFixture } from "../../setup/fixtures";

vi.mock("@/lib/data/backend", () => ({
  usesRemoteData: () => true,
}));

vi.mock("@/lib/sync/outbox", () => ({
  hydrateOutboxMirror: vi.fn().mockResolvedValue(undefined),
  getOutboxPendingCocinaSync: vi.fn(() => []),
  getOutboxPendingPostresSync: vi.fn(() => []),
  listOutboxEntries: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/sync/reconcile-outbox", () => ({
  reconcileOutbox: vi.fn().mockResolvedValue(0),
  isOutboxEntryActionable: () => true,
}));

vi.mock("@/lib/sync/operativa-snapshot", () => ({
  saveOperativaSnapshot: vi.fn().mockResolvedValue(undefined),
  loadOperativaSnapshot: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseAccessToken: vi.fn().mockResolvedValue("test-token"),
}));

vi.mock("@/lib/data/data-layer", () => ({
  getComandasRepository: () => ({
    getAll: vi.fn().mockResolvedValue([
      { ...comandaCocinaFixture(), id: "remoto-1", estadoPanel: "sentados" },
    ]),
  }),
  getPostresRepository: () => ({
    getAll: vi.fn().mockResolvedValue([]),
  }),
}));

import { loadOperativaMerged } from "@/lib/sync/operativa-read";
import { setComandasCache, getComandasCache } from "@/lib/sync/operativa-cache";

describe("loadOperativaMerged remoto", () => {
  beforeEach(() => {
    setComandasCache([]);
  });

  it("usa Supabase como fuente de verdad cuando hay remoto", async () => {
    setComandasCache([
      { ...comandaCocinaFixture(), id: "local-nueva", estadoPanel: "sentados" },
    ]);
    const { cocina } = await loadOperativaMerged();
    expect(cocina).toHaveLength(2);
    expect(cocina.find((c) => c.id === "remoto-1")).toBeTruthy();
    expect(cocina.find((c) => c.id === "local-nueva")).toBeTruthy();
  });
});
