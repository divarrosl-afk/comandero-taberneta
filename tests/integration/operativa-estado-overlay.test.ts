import { describe, expect, it, vi, beforeEach } from "vitest";
import { comandaCocinaFixture } from "../setup/fixtures";

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseAccessToken: vi.fn().mockResolvedValue("test-token"),
}));

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

import { getSyncDb } from "@/lib/sync/idb";
import { clearOperativaCache } from "@/lib/sync/operativa-cache";
import { setClientRuntimeConfig } from "@/lib/supabase/runtime-config";

async function clearSnapshotStore(): Promise<void> {
  const db = await getSyncDb();
  await db.clear("snapshot");
}

describe("loadOperativaMerged — overlay estados outbox", () => {
  beforeEach(async () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_BACKEND", "supabase");
    setClientRuntimeConfig({
      backend: "supabase",
      supabase: {
        url: "https://example.supabase.co",
        anonKey: "anon",
        restauranteId: "rest-1",
      },
    });
    clearOperativaCache();
    await clearSnapshotStore();
    await clearOutbox();

    vi.mocked(getPostresRepository).mockReturnValue({
      getAll: vi.fn().mockResolvedValue([]),
      getById: vi.fn().mockResolvedValue(undefined),
    } as never);
  });

  it("con remoto disponible Supabase gana sobre outbox local", async () => {
    vi.mocked(getComandasRepository).mockReturnValue({
      getAll: vi.fn().mockResolvedValue([
        comandaCocinaFixture({ id: "r1", estadoPanel: "sentados" }),
      ]),
      getById: vi.fn().mockResolvedValue(
        comandaCocinaFixture({ id: "r1", estadoPanel: "sentados" }),
      ),
    } as never);

    await enqueueCocinaEstado("r1", "tiene_primeros");

    const { cocina } = await loadOperativaMerged();
    expect(cocina.find((c) => c.id === "r1")?.estadoPanel).toBe("sentados");
  });

  it("create sentados con estado actualizado no duplica", async () => {
    vi.mocked(getComandasRepository).mockReturnValue({
      getAll: vi.fn().mockRejectedValue(new Error("offline")),
      getById: vi.fn().mockRejectedValue(new Error("offline")),
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

  it("tras vaciar outbox remoto vuelve a ser fuente del estado", async () => {
    vi.mocked(getComandasRepository).mockReturnValue({
      getAll: vi.fn().mockResolvedValue([
        comandaCocinaFixture({ id: "r2", estadoPanel: "sentados" }),
      ]),
      getById: vi.fn().mockResolvedValue(
        comandaCocinaFixture({ id: "r2", estadoPanel: "sentados" }),
      ),
    } as never);

    await enqueueCocinaEstado("r2", "tiene_primeros");
    const conRemoto = await loadOperativaMerged();
    expect(conRemoto.cocina.find((c) => c.id === "r2")?.estadoPanel).toBe("sentados");

    await removeOutboxForEntity(["cocina_estado"], "r2");
    const sinOutbox = await loadOperativaMerged();
    expect(sinOutbox.cocina.find((c) => c.id === "r2")?.estadoPanel).toBe("sentados");
  });
});
