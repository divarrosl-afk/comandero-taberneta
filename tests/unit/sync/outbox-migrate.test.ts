import { describe, expect, it, beforeEach } from "vitest";
import { comandaCocinaFixture, comandaPostresFixture } from "../../setup/fixtures";
import {
  countOutbox,
  migrateLegacyPendingQueue,
  listOutboxEntries,
  enqueueCocinaCreate,
} from "@/lib/sync/outbox";

const PENDING_COCINA_KEY = "comandero-taberneta:sync-pending-cocina";
const PENDING_POSTRES_KEY = "comandero-taberneta:sync-pending-postres";

describe("migrateLegacyPendingQueue", () => {
  beforeEach(() => {
    localStorage.removeItem(PENDING_COCINA_KEY);
    localStorage.removeItem(PENDING_POSTRES_KEY);
  });

  it("migra sync-pending-* a IndexedDB y limpia localStorage", async () => {
    localStorage.setItem(
      PENDING_COCINA_KEY,
      JSON.stringify([comandaCocinaFixture({ id: "leg-c1" })]),
    );
    localStorage.setItem(
      PENDING_POSTRES_KEY,
      JSON.stringify([comandaPostresFixture({ id: "leg-p1" })]),
    );

    await migrateLegacyPendingQueue();

    expect(await countOutbox()).toBe(2);
    expect(localStorage.getItem(PENDING_COCINA_KEY)).toBeNull();
    expect(localStorage.getItem(PENDING_POSTRES_KEY)).toBeNull();
    const ids = (await listOutboxEntries()).map((e) => e.entityId);
    expect(ids).toContain("leg-c1");
    expect(ids).toContain("leg-p1");
  });

  it("es idempotente si se ejecuta varias veces", async () => {
    localStorage.setItem(
      PENDING_COCINA_KEY,
      JSON.stringify([comandaCocinaFixture({ id: "leg-c2" })]),
    );

    await migrateLegacyPendingQueue();
    await migrateLegacyPendingQueue();
    await migrateLegacyPendingQueue();

    expect(await countOutbox()).toBe(1);
    expect(localStorage.getItem(PENDING_COCINA_KEY)).toBeNull();
  });

  it("coalesce por id si legacy se reinyectara manualmente", async () => {
    const comanda = comandaCocinaFixture({ id: "leg-c3", mesa: "C1" });
    localStorage.setItem(PENDING_COCINA_KEY, JSON.stringify([comanda]));

    await migrateLegacyPendingQueue();
    await enqueueCocinaCreate(comandaCocinaFixture({ id: "leg-c3", mesa: "C9" }));

    expect(await countOutbox()).toBe(1);
    const entries = await listOutboxEntries();
    expect((entries[0].payload as { mesa: string }).mesa).toBe("C9");
  });
});
