import { describe, expect, it } from "vitest";
import {
  actualizarEstadoComandaLocal,
  eliminarComandaLocal,
  getComandasLocales,
  guardarComandaLocal,
} from "@/lib/storage/comandas-local";
import { comandaCocinaFixture } from "../setup/fixtures";

describe("comandas-local storage", () => {
  it("guarda y lista comandas", () => {
    guardarComandaLocal(comandaCocinaFixture({ id: "s1" }));
    expect(getComandasLocales()).toHaveLength(1);
    expect(getComandasLocales()[0].id).toBe("s1");
  });

  it("actualiza estado", () => {
    guardarComandaLocal(comandaCocinaFixture({ id: "s2" }));
    const updated = actualizarEstadoComandaLocal("s2", "listo");
    expect(updated?.estadoPanel).toBe("listo");
  });

  it("elimina comanda", () => {
    guardarComandaLocal(comandaCocinaFixture({ id: "s3" }));
    expect(eliminarComandaLocal("s3")).toBe(true);
    expect(getComandasLocales()).toHaveLength(0);
  });
});
