import { describe, expect, it } from "vitest";
import {
  enqueueCocinaCreate,
  countOutbox,
  clearOutbox,
  enqueueCocinaEstado,
  listOutboxEntries,
} from "@/lib/sync/outbox";
import { comandaCocinaFixture } from "../../setup/fixtures";

describe("outbox IndexedDB", () => {
  it("añade create y cuenta operaciones", async () => {
    await enqueueCocinaCreate(comandaCocinaFixture({ id: "o1" }));
    expect(await countOutbox()).toBe(1);
  });

  it("coalesce create por entity id", async () => {
    await enqueueCocinaCreate(comandaCocinaFixture({ id: "o2", mesa: "C1" }));
    await enqueueCocinaCreate(comandaCocinaFixture({ id: "o2", mesa: "C2" }));
    expect(await countOutbox()).toBe(1);
    const entries = await listOutboxEntries();
    expect((entries[0].payload as { mesa: string }).mesa).toBe("C2");
  });

  it("estado en create pendiente no duplica op", async () => {
    await enqueueCocinaCreate(comandaCocinaFixture({ id: "o3" }));
    await enqueueCocinaEstado("o3", "listo");
    expect(await countOutbox()).toBe(1);
    const entries = await listOutboxEntries();
    expect((entries[0].payload as { estadoPanel: string }).estadoPanel).toBe(
      "listo",
    );
  });

  it("limpia cola", async () => {
    await enqueueCocinaCreate(comandaCocinaFixture({ id: "o4" }));
    await clearOutbox();
    expect(await countOutbox()).toBe(0);
  });
});
