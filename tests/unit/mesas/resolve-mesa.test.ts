import { describe, expect, it } from "vitest";
import {
  comandaPerteneceAMesa,
  getNombreMesaComanda,
  isUuid,
  resolveNombreMesaComanda,
  resolveZonaMesaComanda,
} from "@/lib/mesas/resolve-mesa";
import { guardarMesasConfig } from "@/lib/storage/mesas";
import type { MesaConfig } from "@/types/mesas";

const MESA_UUID = "b73432dc-a1b2-4c3d-8e9f-123456789abc";

function mesaFixture(): MesaConfig {
  return {
    id: MESA_UUID,
    codigo: "C1",
    nombreVisible: "12",
    zona: "comedor",
    activa: true,
    orden: 1,
    permiteVarianteB: false,
    esVarianteB: false,
  };
}

describe("resolve-mesa", () => {
  it("detecta UUID", () => {
    expect(isUuid(MESA_UUID)).toBe(true);
    expect(isUuid("C1")).toBe(false);
  });

  it("resolveNombreMesaComanda encuentra mesa por id sin mesaCodigo", () => {
    const mesas = [mesaFixture()];
    expect(
      resolveNombreMesaComanda({ mesa: MESA_UUID }, mesas),
    ).toBe("12");
  });

  it("resolveZonaMesaComanda devuelve zona de la mesa", () => {
    const mesas = [mesaFixture()];
    expect(resolveZonaMesaComanda({ mesa: MESA_UUID }, mesas)).toBe("comedor");
  });

  it("getNombreMesaComanda usa mesaCodigo cuando mesa es UUID", () => {
    guardarMesasConfig([mesaFixture()]);
    expect(
      getNombreMesaComanda({ mesa: MESA_UUID, mesaCodigo: "C1" }),
    ).toBe("12");
  });

  it("comandaPerteneceAMesa enlaza UUID con id de mesa", () => {
    guardarMesasConfig([mesaFixture()]);
    expect(
      comandaPerteneceAMesa({ mesa: MESA_UUID, mesaCodigo: "C1" }, MESA_UUID),
    ).toBe(true);
  });
});
