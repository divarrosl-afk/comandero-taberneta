import { describe, expect, it } from "vitest";
import { isOutboxEntryActionable } from "@/lib/sync/reconcile-outbox";
import { isEstadoPanelActivo, normalizeEstadoPanel } from "@/types/panel";
import type { OutboxEntry } from "@/lib/sync/outbox-types";

describe("isOutboxEntryActionable", () => {
  it("marca como no accionable entradas en backoff", () => {
    const entry: OutboxEntry = {
      opId: "op1",
      kind: "cocina_estado",
      entityId: "c1",
      payload: { estado: "sentados" },
      createdAt: new Date().toISOString(),
      retries: 2,
    };
    expect(isOutboxEntryActionable(entry)).toBe(false);
  });

  it("permite reintento en primer fallo tras espera", () => {
    const entry: OutboxEntry = {
      opId: "op2",
      kind: "cocina_create",
      entityId: "c2",
      payload: {},
      createdAt: new Date(Date.now() - 60_000).toISOString(),
      retries: 1,
    };
    expect(isOutboxEntryActionable(entry)).toBe(true);
  });
});

describe("estado panel activo en mesas", () => {
  it("sentados cuenta como comanda activa", () => {
    expect(isEstadoPanelActivo(normalizeEstadoPanel("sentados"))).toBe(true);
    expect(isEstadoPanelActivo(normalizeEstadoPanel("mesa_libre"))).toBe(false);
  });
});
