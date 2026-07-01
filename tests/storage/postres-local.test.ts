import { describe, expect, it } from "vitest";
import {
  getPostresLocales,
  guardarPostresLocal,
  actualizarEstadoPostresLocal,
} from "@/lib/storage/postres-local";
import { comandaPostresFixture } from "../setup/fixtures";

describe("postres-local storage", () => {
  it("guarda y actualiza postres", () => {
    guardarPostresLocal(comandaPostresFixture({ id: "ps1" }));
    expect(getPostresLocales()).toHaveLength(1);
    const updated = actualizarEstadoPostresLocal("ps1", "servido");
    expect(updated?.estadoPanel).toBe("servido");
  });
});
