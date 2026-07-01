import { describe, expect, it } from "vitest";
import {
  addPendingCocina,
  getPendingCocina,
  countPendingSync,
} from "@/lib/sync/emergency-local";
import { countOutbox, enqueueCocinaCreate } from "@/lib/sync/outbox";
import { comandaCocinaFixture } from "../../setup/fixtures";

describe("emergency-local facade", () => {
  it("addPending delega a outbox", async () => {
    await enqueueCocinaCreate(comandaCocinaFixture({ id: "e1" }));
    addPendingCocina(comandaCocinaFixture({ id: "e2" }));
    // allow microtask
    await new Promise((r) => setTimeout(r, 10));
    expect(getPendingCocina().some((c) => c.id === "e1")).toBe(true);
    expect(await countOutbox()).toBeGreaterThanOrEqual(1);
  });

  it("countPendingSync async", async () => {
    await enqueueCocinaCreate(comandaCocinaFixture({ id: "e3" }));
    expect(await countPendingSync()).toBe(1);
  });
});
