import { describe, expect, it } from "vitest";
import {
  addPendingCocina,
  clearPendingSync,
  countPendingSync,
  getPendingCocina,
  removePendingCocina,
  updatePendingCocinaEstado,
} from "@/lib/sync/emergency-local";
import { comandaCocinaFixture } from "../../setup/fixtures";

describe("emergency-local", () => {
  it("añade y cuenta pendientes", () => {
    addPendingCocina(comandaCocinaFixture({ id: "p1" }));
    expect(countPendingSync()).toBe(1);
    expect(getPendingCocina()[0].id).toBe("p1");
  });

  it("deduplica por id al añadir", () => {
    addPendingCocina(comandaCocinaFixture({ id: "p1", mesa: "C1" }));
    addPendingCocina(comandaCocinaFixture({ id: "p1", mesa: "C2" }));
    expect(getPendingCocina()).toHaveLength(1);
    expect(getPendingCocina()[0].mesa).toBe("C2");
  });

  it("actualiza estado de pendiente", () => {
    addPendingCocina(comandaCocinaFixture({ id: "p1" }));
    const updated = updatePendingCocinaEstado("p1", "listo");
    expect(updated?.estadoPanel).toBe("listo");
  });

  it("elimina pendiente y limpia cola", () => {
    addPendingCocina(comandaCocinaFixture({ id: "p1" }));
    removePendingCocina("p1");
    expect(countPendingSync()).toBe(0);
    clearPendingSync();
    expect(getPendingCocina()).toEqual([]);
  });
});
