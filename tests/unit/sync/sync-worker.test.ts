import { describe, expect, it, vi, beforeEach } from "vitest";
import { comandaCocinaFixture } from "../../setup/fixtures";

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

import { getComandasRepository } from "@/lib/data/data-layer";
import {
  enqueueCocinaCreate,
  clearOutbox,
  countOutbox,
  listOutboxEntries,
} from "@/lib/sync/outbox";
import { flushOutbox, isOutboxFlushing } from "@/lib/sync/sync-worker";

describe("flushOutbox", () => {
  beforeEach(async () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_BACKEND", "supabase");
    await clearOutbox();
    vi.stubGlobal("navigator", { onLine: true });
  });

  it("procesa creates y vacía cola", async () => {
    const crear = vi.fn().mockResolvedValue({});
    vi.mocked(getComandasRepository).mockReturnValue({ crear } as never);

    await enqueueCocinaCreate(comandaCocinaFixture({ id: "f1" }));
    const result = await flushOutbox();

    expect(result.ok).toBe(1);
    expect(crear).toHaveBeenCalledOnce();
    expect(await countOutbox()).toBe(0);
  });

  it("reintento fallido conserva operación e incrementa retries", async () => {
    const crear = vi.fn().mockRejectedValue(new Error("network down"));
    vi.mocked(getComandasRepository).mockReturnValue({ crear } as never);

    await enqueueCocinaCreate(comandaCocinaFixture({ id: "f2" }));
    const result = await flushOutbox();

    expect(result.ok).toBe(0);
    expect(result.fail).toBe(1);
    expect(await countOutbox()).toBe(1);
    const entries = await listOutboxEntries();
    expect(entries[0].retries).toBe(1);
    expect(crear).toHaveBeenCalledOnce();
  });

  it("duplicate key elimina entrada sin reintentar (idempotente)", async () => {
    const crear = vi.fn().mockRejectedValue(
      new Error('duplicate key value violates unique constraint "23505"'),
    );
    vi.mocked(getComandasRepository).mockReturnValue({ crear } as never);

    await enqueueCocinaCreate(comandaCocinaFixture({ id: "f3" }));
    const result = await flushOutbox();

    expect(result.ok).toBe(1);
    expect(await countOutbox()).toBe(0);
  });

  it("no ejecuta flush concurrente (evita bucles)", async () => {
    let resolveCrear!: () => void;
    const crearGate = new Promise<void>((r) => {
      resolveCrear = r;
    });
    const crear = vi.fn(
      () =>
        new Promise((resolve) => {
          crearGate.then(() => resolve({}));
        }),
    );
    vi.mocked(getComandasRepository).mockReturnValue({ crear } as never);

    await enqueueCocinaCreate(comandaCocinaFixture({ id: "f4" }));

    const first = flushOutbox();
    expect(isOutboxFlushing()).toBe(true);
    const second = await flushOutbox();
    expect(second).toEqual({ ok: 0, fail: 0 });

    resolveCrear();
    const firstResult = await first;
    expect(firstResult.ok).toBe(1);
    expect(isOutboxFlushing()).toBe(false);
  });
});
