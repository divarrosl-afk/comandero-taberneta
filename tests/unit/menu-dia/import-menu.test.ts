import { describe, expect, it } from "vitest";
import { matchMenuConCatalogo } from "@/lib/menu-dia/match-catalogo";
import { parseMenuDiaTexto } from "@/lib/menu-dia/parse-menu-texto";
import { productoCatalogoFixture } from "../../setup/fixtures";

describe("parse-menu-texto", () => {
  it("parsea menú domingo con primeros, segundos, precio y suplementos", () => {
    const texto = `LA TABERNETA CA LA INGRID
MENÚ DOMINGO
Fecha: 28/06/2026
PRIMEROS
Ensalada de piña, manzana, aguacate, tomate, lechuga y escamas de parmesano
Salmorejo casero
Foie con mermelada de higos (+3 €)
SEGUNDOS
Entrecot de ternera (250gr) a la brasa con guarnición (+12 €)
EL PRECIO INCLUYE: PAN Y POSTRE. BEBIDA NO INCLUIDA
22,00 €`;

    const parsed = parseMenuDiaTexto(texto);

    expect(parsed.fecha).toBe("2026-06-28");
    expect(parsed.precioMenu).toBe(22);
    expect(parsed.primeros.length).toBeGreaterThanOrEqual(3);
    expect(parsed.segundos.some((p) => p.nombre.includes("Entrecot"))).toBe(
      true,
    );
    const foie = parsed.primeros.find((p) => p.nombre.includes("Foie"));
    expect(foie?.suplemento).toBe(3);
    const entrecot = parsed.segundos.find((p) => p.nombre.includes("Entrecot"));
    expect(entrecot?.suplemento).toBe(12);
  });
});

describe("match-catalogo", () => {
  it("empareja platos del menú con productos de carta", () => {
    const productos = [
      productoCatalogoFixture({
        id: "p-foie",
        nombre: "Foie con mermelada de higos",
        seccion: "primeros",
        usosComanda: ["primeros"],
      }),
      productoCatalogoFixture({
        id: "p-entrecot",
        nombre: "Entrecot de ternera",
        seccion: "segundos",
        usosComanda: ["segundos"],
      }),
    ];

    const match = matchMenuConCatalogo(
      [{ nombre: "Foie con mermelada de higos", suplemento: 3 }],
      [{ nombre: "Entrecot de ternera (250gr) a la brasa", suplemento: 12 }],
      productos,
    );

    expect(match.primeros[0].productoId).toBe("p-foie");
    expect(match.segundos[0].productoId).toBe("p-entrecot");
  });
});
