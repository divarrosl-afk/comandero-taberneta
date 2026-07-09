import { describe, expect, it } from "vitest";
import { crearCatalogoDefault } from "@/data/catalogo-default";
import {
  esProductoLegacyObsoleto,
  resolverNombreCanonico,
} from "@/lib/catalogo/catalogo-legacy";
import { migrarProducto } from "@/lib/carta/migrate-producto";
import { mergeCatalogoCompleto } from "@/lib/setup/sync-catalogo";
import type { ProductoCatalogo } from "@/types/catalogo";

function legacy(
  nombre: string,
  categoria: ProductoCatalogo["categoriaCarta"],
  opts: Partial<ProductoCatalogo> = {},
): ProductoCatalogo {
  return migrarProducto({
    id: `legacy-${nombre}`,
    nombre,
    seccion: "entrantes",
    tipo: "carta",
    cartaServicio: "almuerzo",
    categoriaCarta: categoria,
    usosComanda: ["entrantes", "primeros", "segundos"],
    precio: 4,
    activo: true,
    agotado: false,
    favorito: false,
    orden: 0,
    ingredientes: [],
    alergenos: [],
    recomendado: false,
    ...opts,
  });
}

describe("catalogo legacy", () => {
  const defectos = crearCatalogoDefault();
  const nombres = new Set(
    defectos.map((d) => d.nombre.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")),
  );

  it("resuelve nombres legacy de bocadillos y torradas", () => {
    expect(
      resolverNombreCanonico(
        { nombre: "Bocadillo Lomo (medio)", categoriaCarta: "bocadillosCalientes" },
        nombres,
      ),
    ).toBe("1/2 BOC Lomo");
    expect(
      resolverNombreCanonico(
        { nombre: "Bocadillo Lomo (grande)", categoriaCarta: "bocadillosCalientes" },
        nombres,
      ),
    ).toBe("BOC Lomo");
    expect(
      resolverNombreCanonico(
        {
          nombre: "Torrada Escalivada y queso de cabra (desayuno)",
          categoriaCarta: "torradas",
        },
        nombres,
      ),
    ).toBe("TORRA DESAYUNO DE Escalivada y queso de cabra");
    expect(
      resolverNombreCanonico(
        {
          nombre: "Torrada Escalivada y queso de cabra (grande)",
          categoriaCarta: "torradas",
        },
        nombres,
      ),
    ).toBe("TORRA CARTA DE Escalivada y queso de cabra");
  });

  it("detecta productos legacy obsoletos", () => {
    expect(
      esProductoLegacyObsoleto(
        legacy("Bocadillo Bacon (medio)", "bocadillosCalientes"),
        defectos,
      ),
    ).toBe(true);
    expect(
      esProductoLegacyObsoleto(
        legacy("1/2 BOC Bacon", "bocadillosCalientes"),
        defectos,
      ),
    ).toBe(false);
  });
});

describe("mergeCatalogoCompleto", () => {
  const defectos = crearCatalogoDefault();

  it("elimina duplicados legacy y deja solo nombres canónicos", () => {
    const existentes = [
      legacy("Bocadillo Lomo (medio)", "bocadillosCalientes", { favorito: true }),
      legacy("Bocadillo Lomo (grande)", "bocadillosCalientes"),
      legacy("1/2 BOC Lomo", "bocadillosCalientes"),
      legacy("BOC Lomo", "bocadillosCalientes"),
      legacy(
        "Torrada Escalivada y queso de cabra (desayuno)",
        "torradas",
        { nombreCorto: "Desayuno" },
      ),
      legacy("Torrada Escalivada y queso de cabra (grande)", "torradas", {
        nombreCorto: "Escalivada y queso de cabra",
      }),
      legacy("TORRA DESAYUNO DE Escalivada y queso de cabra", "torradas"),
      legacy("TORRA CARTA DE Escalivada y queso de cabra", "torradas"),
    ];

    const merged = mergeCatalogoCompleto(existentes, defectos);
    const lomos = merged.filter((p) =>
      p.nombre.includes("Lomo") && p.categoriaCarta === "bocadillosCalientes",
    );
    const escalivada = merged.filter(
      (p) =>
        p.nombre.includes("Escalivada y queso de cabra") &&
        p.categoriaCarta === "torradas",
    );

    expect(lomos.map((p) => p.nombre).sort()).toEqual([
      "1/2 BOC Lomo",
      "BOC Lomo",
    ]);
    expect(escalivada.map((p) => p.nombre).sort()).toEqual([
      "TORRA CARTA DE Escalivada y queso de cabra",
      "TORRA DESAYUNO DE Escalivada y queso de cabra",
    ]);
    expect(lomos.find((p) => p.nombre === "1/2 BOC Lomo")?.favorito).toBe(true);
    expect(escalivada.every((p) => !p.nombreCorto)).toBe(true);
  });

  it("tiene dos variantes por bocadillo y torrada en defaults", () => {
    const calientes = defectos.filter(
      (p) => p.categoriaCarta === "bocadillosCalientes",
    );
    const frios = defectos.filter((p) => p.categoriaCarta === "bocadillosFrios");
    const torradas = defectos.filter(
      (p) => p.categoriaCarta === "torradas" && p.cartaServicio === "almuerzo",
    );

    expect(calientes.length).toBe(29);
    expect(frios.length).toBe(22);
    expect(torradas.length).toBe(34);
    expect(calientes.filter((p) => /^1\/2 BOC |^BOC /.test(p.nombre)).length).toBe(
      calientes.length - 1,
    );
    expect(
      torradas.every((p) =>
        /^TORRA (DESAYUNO|CARTA) DE /.test(p.nombre),
      ),
    ).toBe(true);
  });
});
