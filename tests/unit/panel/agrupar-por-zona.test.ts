import { describe, expect, it } from "vitest";
import { comandaCocinaFixture } from "../../setup/fixtures";
import { agruparComandasPorZona } from "@/lib/panel/agrupar-por-zona";
import type { MesaConfig } from "@/types/mesas";

const MESA_BARRA: MesaConfig = {
  id: "mesa-b1",
  codigo: "B1",
  nombreVisible: "B1",
  zona: "barra",
  activa: true,
  orden: 1,
  permiteVarianteB: false,
  esVarianteB: false,
};

const MESA_RAMBLA: MesaConfig = {
  id: "mesa-r1",
  codigo: "R1",
  nombreVisible: "R1",
  zona: "rambla",
  activa: true,
  orden: 1,
  permiteVarianteB: false,
  esVarianteB: false,
};

const MESA_COMEDOR: MesaConfig = {
  id: "mesa-c1",
  codigo: "C1",
  nombreVisible: "12",
  zona: "comedor",
  activa: true,
  orden: 2,
  permiteVarianteB: false,
  esVarianteB: false,
};

describe("agrupar-por-zona", () => {
  it("agrupa comandas por zona en orden barra rambla comedor fachada terraza", () => {
    const mesas = [MESA_BARRA, MESA_RAMBLA, MESA_COMEDOR];
    const comandas = [
      comandaCocinaFixture({ id: "c-comedor", mesa: MESA_COMEDOR.id }),
      comandaCocinaFixture({ id: "c-barra", mesa: MESA_BARRA.id }),
      comandaCocinaFixture({ id: "c-rambla", mesa: MESA_RAMBLA.id }),
    ];

    const grupos = agruparComandasPorZona(comandas, mesas);

    expect(grupos.map((g) => g.zona)).toEqual(["barra", "rambla", "comedor"]);
    expect(grupos[0].comandas[0].id).toBe("c-barra");
    expect(grupos[1].comandas[0].id).toBe("c-rambla");
    expect(grupos[2].comandas[0].id).toBe("c-comedor");
  });

  it("omite zonas sin comandas", () => {
    const grupos = agruparComandasPorZona(
      [comandaCocinaFixture({ mesa: MESA_BARRA.id })],
      [MESA_BARRA],
    );
    expect(grupos).toHaveLength(1);
    expect(grupos[0].zona).toBe("barra");
  });
});
