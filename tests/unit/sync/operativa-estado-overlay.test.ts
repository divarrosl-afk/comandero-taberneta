import { describe, expect, it } from "vitest";
import {
  applyEstadoOverlay,
  buildEstadoOverlayFromOutbox,
} from "@/lib/sync/operativa-read";
import type { OutboxEntry } from "@/lib/sync/outbox-types";
import { comandaCocinaFixture } from "../../setup/fixtures";

import type { EstadoPanel } from "@/types/panel";

function estadoEntry(
  entityId: string,
  estado: EstadoPanel,
  createdAt: string,
): OutboxEntry {
  return {
    opId: `op-${entityId}-${createdAt}`,
    kind: "cocina_estado",
    entityId,
    payload: { estado },
    createdAt,
    retries: 0,
  };
}

describe("buildEstadoOverlayFromOutbox", () => {
  it("last-write-wins por entityId según createdAt", () => {
    const entries: OutboxEntry[] = [
      estadoEntry("x1", "sentados", "2025-01-01T10:00:00Z"),
      estadoEntry("x1", "tiene_primeros", "2025-01-01T11:00:00Z"),
    ];

    const overlay = buildEstadoOverlayFromOutbox(
      entries,
      "cocina_estado",
      "cocina_create",
    );
    expect(overlay.get("x1")).toBe("tiene_primeros");
  });

  it("create sentados aporta estadoPanel al overlay", () => {
    const entries: OutboxEntry[] = [
      {
        opId: "op-create",
        kind: "cocina_create",
        entityId: "c1",
        payload: comandaCocinaFixture({ id: "c1", estadoPanel: "marcha_segundos" }),
        createdAt: "2025-01-01T12:00:00Z",
        retries: 0,
      },
    ];

    const overlay = buildEstadoOverlayFromOutbox(
      entries,
      "cocina_estado",
      "cocina_create",
    );
    expect(overlay.get("c1")).toBe("marcha_segundos");
  });
});

describe("applyEstadoOverlay", () => {
  it("no duplica entidades, solo parchea estadoPanel", () => {
    const items = [
      comandaCocinaFixture({ id: "a", estadoPanel: "sentados" }),
      comandaCocinaFixture({ id: "b", estadoPanel: "sentados" }),
    ];
    const overlay = new Map<string, EstadoPanel>([["a", "tiene_primeros"]]);

    const result = applyEstadoOverlay(items, overlay);
    expect(result).toHaveLength(2);
    expect(result.find((c) => c.id === "a")?.estadoPanel).toBe("tiene_primeros");
    expect(result.find((c) => c.id === "b")?.estadoPanel).toBe("sentados");
  });
});
