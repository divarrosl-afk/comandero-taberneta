import { describe, expect, it } from "vitest";
import { prepararSyncCatalogo } from "@/lib/setup/sync-catalogo";
import type { ProductoCatalogo } from "@/types/catalogo";

function bebida(
  nombre: string,
  categoria: "refrescos" | "cervezas",
  id = "id-1",
): ProductoCatalogo {
  return {
    id,
    nombre,
    seccion: "bebidas",
    tipo: "carta",
    cartaServicio: "bebidas",
    categoriaCarta: categoria,
    usosComanda: ["bebidas"],
    precioCarta: 2.5,
    activo: true,
    agotado: false,
    favorito: false,
    orden: 1000,
    ingredientes: [],
    alergenos: [],
    recomendado: false,
  };
}

describe("prepararSyncCatalogo", () => {
  it("inserta productos nuevos que faltan en remoto", () => {
    const existentes = [bebida("Agua", "refrescos", "agua-id")];
    const defectos = [
      bebida("Agua", "refrescos", "nuevo-id"),
      bebida("Zumo natural", "refrescos", "nuevo-id-2"),
    ];

    const { aSubir, inserted, updated } = prepararSyncCatalogo(defectos, existentes);

    expect(inserted).toBe(1);
    expect(updated).toBe(0);
    expect(aSubir).toHaveLength(1);
    expect(aSubir[0]?.nombre).toBe("Zumo natural");
    expect(aSubir[0]?.categoriaCarta).toBe("refrescos");
  });

  it("actualiza categoría y orden sin perder id ni favorito", () => {
    const existentes = [
      {
        ...bebida("Caña", "refrescos", "cana-vieja"),
        favorito: true,
      },
    ];
    const defectos = [bebida("Caña", "cervezas", "otro-id")];

    const { aSubir, inserted, updated } = prepararSyncCatalogo(defectos, existentes);

    expect(inserted).toBe(1);
    expect(updated).toBe(0);
    expect(aSubir[0]?.id).not.toBe("cana-vieja");
    expect(aSubir[0]?.categoriaCarta).toBe("cervezas");
  });

  it("no duplica si ya existe con misma clave", () => {
    const producto = bebida("Quinto DAMM", "cervezas", "quinto-id");
    const { aSubir, inserted, updated } = prepararSyncCatalogo(
      [producto],
      [producto],
    );

    expect(inserted).toBe(0);
    expect(updated).toBe(0);
    expect(aSubir).toHaveLength(0);
  });

  it("no reinserta productos eliminados por el admin", () => {
    const defectos = [bebida("Tarta cheesebrownie", "refrescos", "def-id")];
    const existentes: ProductoCatalogo[] = [];
    const clavesExcluidas = new Set(["bebidas|refrescos|tarta cheesebrownie"]);

    const { aSubir, inserted } = prepararSyncCatalogo(
      defectos,
      existentes,
      clavesExcluidas,
    );

    expect(inserted).toBe(0);
    expect(aSubir).toHaveLength(0);
  });
});
