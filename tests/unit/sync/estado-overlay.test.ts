import { describe, expect, it, beforeEach } from "vitest";
import { buildEstadoOverlayFromOutbox } from "@/lib/sync/operativa-read";
import { enqueueCocinaEstado, clearOutbox, listOutboxEntries } from "@/lib/sync/outbox";
import { isOutboxEntryActionable } from "@/lib/sync/reconcile-outbox";

describe("buildEstadoOverlayFromOutbox", () => {
  beforeEach(async () => {
    await clearOutbox();
  });

  it("aplica estado pendiente offline", async () => {
    await enqueueCocinaEstado("s1", "marcha_segundos");
    const entries = await listOutboxEntries();
    expect(entries.length).toBeGreaterThan(0);
    expect(isOutboxEntryActionable(entries[0])).toBe(true);
    const overlay = buildEstadoOverlayFromOutbox(
      entries,
      "cocina_estado",
      "cocina_create",
    );
    expect(overlay.get("s1")).toBe("marcha_segundos");
  });
});
