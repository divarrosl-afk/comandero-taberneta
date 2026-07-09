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

  it("separa platos con suplemento en línea propia (formato Taberneta)", () => {
    const texto = `PRIMEROS
Ensalada de burrata con tomates secos deshidratados y aguacate
(+5 €) Timbal de escalivada con queso de cabra y vinagreta de frutos secos y miel
(+5 €)
SEGUNDOS
Entrecot de ternera (250gr) a la brasa con guarnición
(+10 €) Solomillo de ternera (280gr) a la brasa con guarnición
(+14 €) Chuletón de ternera (500gr) a la brasa con guarnición
(+16 €)
14,00 €`;

    const parsed = parseMenuDiaTexto(texto);

    expect(parsed.primeros).toHaveLength(2);
    expect(parsed.primeros[0].nombre).toContain("burrata");
    expect(parsed.primeros[1].nombre).toContain("Timbal");
    expect(parsed.primeros[1].suplemento).toBe(5);

    expect(parsed.segundos).toHaveLength(3);
    expect(parsed.segundos[0].nombre).toContain("Entrecot");
    expect(parsed.segundos[0].suplemento).toBeUndefined();
    expect(parsed.segundos[1].nombre).toContain("Solomillo");
    expect(parsed.segundos[1].suplemento).toBe(10);
    expect(parsed.segundos[2].suplemento).toBe(14);
  });

  it("separa Churrasco y Salchichas con suplemento (+3 €)", () => {
    const casos = [
      {
        texto: `SEGUNDOS
Churrasco (+3 €) Salchichas
14,00 €`,
        churrasco: 3,
      },
      {
        texto: `SEGUNDOS
Churrasco Salchichas (+3 €)
14,00 €`,
        churrasco: 3,
      },
      {
        texto: `SEGUNDOS
Churrasco y salchichas
14,00 €`,
        churrasco: undefined,
      },
      {
        texto: `SEGUNDOS
Churrasco
(+3 €)
Salchichas
14,00 €`,
        churrasco: 3,
      },
      {
        texto: `SEGUNDOS
Churrasco
(+3 €) Salchichas
14,00 €`,
        churrasco: 3,
      },
    ];

    for (const { texto, churrasco } of casos) {
      const parsed = parseMenuDiaTexto(texto);
      expect(parsed.segundos).toHaveLength(2);
      expect(parsed.segundos[0].nombre).toMatch(/^Churrasco$/i);
      expect(parsed.segundos[1].nombre).toMatch(/^Salchichas$/i);
      if (churrasco !== undefined) {
        expect(parsed.segundos[0].suplemento).toBe(churrasco);
        expect(parsed.segundos[1].suplemento).toBeUndefined();
      } else {
        expect(parsed.segundos[0].suplemento).toBeUndefined();
        expect(parsed.segundos[1].suplemento).toBeUndefined();
      }
    }
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

describe("menu-platos-comanda", () => {
  it("muestra nombres del PDF en comanda aunque no haya match en carta", async () => {
    const { productosMenuParaComanda } = await import(
      "@/lib/menu-dia/menu-platos-comanda"
    );

    const lista = productosMenuParaComanda(
      {
        fecha: "2026-06-28",
        precioMenu: 22,
        primerosIds: [],
        segundosIds: [],
        postresIncluidosIds: [],
        activo: true,
        primerosImportados: [
          {
            id: "menu-imp-primeros-0-ensalada",
            nombre: "Ensalada de piña, manzana…",
          },
          {
            id: "menu-imp-primeros-1-foie",
            nombre: "Foie con mermelada de higos",
            suplemento: 3,
          },
        ],
      },
      "primeros",
    );

    expect(lista).toHaveLength(2);
    expect(lista[0].nombre).toContain("Ensalada");
    expect(lista[1].suplemento).toBe(3);
  });
});
