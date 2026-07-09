import { describe, expect, it } from "vitest";
import {
  claveSesionPlatoEditor,
  claveSesionPostreEditor,
} from "@/lib/comanda/editor-sheet-session";

describe("editor-sheet-session", () => {
  it("genera clave estable por producto o plato", () => {
    expect(claveSesionPlatoEditor("nuevo", "prod-1")).toBe("nuevo:prod-1");
    expect(claveSesionPlatoEditor("editar", undefined, "plato-9")).toBe(
      "editar:plato-9",
    );
    expect(claveSesionPostreEditor("postre-3")).toBe("postre:postre-3");
  });

  it("devuelve null sin ids", () => {
    expect(claveSesionPlatoEditor("nuevo")).toBeNull();
    expect(claveSesionPostreEditor()).toBeNull();
  });
});
