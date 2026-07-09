import { describe, expect, it } from "vitest";
import { comandaToTexto } from "@/lib/comanda/format-ticket";
import {
  formatKitchenTicketPlain,
  resolveMesaDisplay,
  sectionHeader,
  stripTicketMarkers,
  toTicketUpper,
} from "@/lib/comanda/ticket-kitchen";
import {
  comandaToTicketBarra,
  comandaToTicketImpresion,
} from "@/modules/impresion-wifi/format-tickets";
import { comandaPostresToTexto } from "@/lib/postres/format-ticket";
import { comandaCocinaFixture, comandaPostresFixture } from "../../setup/fixtures";
import type { ComandaCocina, PlatoComanda } from "@/types/comanda";

function plato(
  overrides: Partial<PlatoComanda> & Pick<PlatoComanda, "nombre">,
): PlatoComanda {
  return {
    id: overrides.id ?? "p-1",
    cantidad: 1,
    modificaciones: [],
    salsas: [],
    estado: "pendiente",
    ...overrides,
  };
}

function comandaEjemplo(): ComandaCocina {
  return {
    ...comandaCocinaFixture(),
    mesa: "12",
    creadaEn: "2025-06-30T18:43:00.000Z",
    entrantes: [
      plato({ id: "e1", nombre: "Pan tomate", cantidad: 1 }),
      plato({ id: "e2", nombre: "Pan tomate", cantidad: 1 }),
      plato({ id: "e3", nombre: "Pan tomate", cantidad: 1 }),
    ],
    primeros: [
      plato({ id: "p1", nombre: "Gazpacho", tipo: "menu" }),
      plato({
        id: "p2",
        nombre: "Burrata",
        tipo: "menu_suplemento",
        suplemento: 5,
      }),
    ],
    segundos: [
      plato({
        id: "s1",
        nombre: "Hamburguesa Angus",
        tipo: "carta",
        modificaciones: ["Sin lactosa", "Muy hecho", "Niños", "Urgente"],
      }),
      plato({ id: "s2", nombre: "Bistec", tipo: "carta" }),
    ],
    bebidas: [
      plato({ id: "b1", nombre: "Agua", cantidad: 1 }),
      plato({ id: "b2", nombre: "Agua", cantidad: 1 }),
      plato({ id: "b3", nombre: "Agua", cantidad: 1 }),
      plato({
        id: "b4",
        nombre: "Vino negro casa",
        modificaciones: [],
        notaLibre: "Gaseosa · 2 copas",
      }),
      plato({ id: "b5", nombre: "Refresco", cantidad: 1 }),
      plato({ id: "b6", nombre: "Refresco", cantidad: 1 }),
    ],
    extras: [],
    observaciones: [],
  };
}

describe("format-ticket", () => {
  it("comandaToTexto incluye código de mesa sin camarero en ticket", () => {
    const texto = comandaToTexto(comandaCocinaFixture(), { nombreMesa: "C1" });
    expect(texto).toContain("C1");
    expect(texto).not.toContain("MESA C1");
    expect(texto).not.toContain("CAMARERO");
    expect(texto).toContain("ENSALADA");
  });

  it("comandaPostresToTexto incluye postres", () => {
    const texto = comandaPostresToTexto(comandaPostresFixture());
    expect(texto).toContain("@D@C1");
    expect(texto).not.toContain("MESA C1");
    expect(texto).not.toContain("@H@");
    expect(texto).toContain("FLAN");
  });
});

describe("ticket-kitchen", () => {
  it("toTicketUpper preserva acentos españoles", () => {
    expect(toTicketUpper("sin láctosa")).toBe("SIN LÁCTOSA");
    expect(toTicketUpper("jalapeño")).toBe("JALAPEÑO");
  });

  it("sectionHeader centra título en mayúsculas", () => {
    const line = sectionHeader("ENTRANTES", 48);
    expect(line).toContain("ENTRANTES");
    expect(line).toMatch(/^=+ ENTRANTES =+/);
  });

  it("resolveMesaDisplay usa código corto de mesa", () => {
    expect(resolveMesaDisplay("mesa-uuid-12", "12")).toEqual({ titulo: "12" });
    expect(resolveMesaDisplay("mesa-uuid-12", "R5")).toEqual({ titulo: "R5" });
  });

  it("resolveMesaDisplay muestra UUID corto si no hay código", () => {
    const uuid = "b73432dc-a1b2-4c3d-8e9f-123456789abc";
    expect(resolveMesaDisplay(uuid)).toEqual({
      titulo: "B73432DC",
    });
  });

  it("agrupa entrantes repetidos", () => {
    const texto = formatKitchenTicketPlain(comandaEjemplo(), "cocina", {
      nombreMesa: "12",
      comensales: 4,
    });
    expect(texto).toContain("12");
    expect(texto).not.toContain("MESA 12");
    expect(texto).toContain("4 COMENSALES");
    expect(texto).toContain("3 PAN TOMATE");
    expect(texto).toContain("(M) GAZPACHO");
    expect(texto).toContain("(M) BURRATA");
    expect(texto).toContain("+5 EUR");
    expect(texto).toContain("(C) HAMBURGUESA ANGUS");
    expect(texto).toContain(">>> URGENTE <<<");
    expect(texto).toContain(" - SIN LACTOSA");
    expect(texto).toContain(" - MUY HECHO");
    expect(texto).toContain(" - NIÑOS");
    expect(texto).not.toMatch(/Sin lactosa.*Muy hecho/i);
    expect(texto).not.toContain(" - SL");
    expect(texto).not.toContain(" - MH");
  });

  it("agrupa bebidas en ticket completo", () => {
    const texto = formatKitchenTicketPlain(comandaEjemplo(), "completo", {
      nombreMesa: "12",
    });
    expect(texto).toContain("3 AGUAS");
    expect(texto).toContain("2 REFRESCOS");
    expect(texto).toContain("VINO NEGRO CASA");
    expect(texto).toContain("PRIMEROS");
  });

  it("ticket impresión incluye todas las secciones", () => {
    const marcado = comandaToTicketImpresion(comandaEjemplo(), { nombreMesa: "12" });
    const texto = stripTicketMarkers(marcado);
    expect(texto).toContain("3 AGUAS");
    expect(texto).toContain("SEGUNDOS");
    expect(texto).toContain("BEBIDAS");
    expect(texto).toContain("ENTRANTES");
  });

  it("ticket completo incluye postres tras segundos y cafés en bebidas", () => {
    const comanda = comandaEjemplo();
    comanda.postres = [{ id: "d1", nombre: "Cruasant", cantidad: 1 }];
    comanda.bebidas.push(
      plato({ id: "c1", nombre: "Té negro", cantidad: 1 }),
    );

    const texto = formatKitchenTicketPlain(comanda, "completo", {
      nombreMesa: "12",
    });

    const idxSegundos = texto.indexOf("SEGUNDOS");
    const idxPostres = texto.indexOf("POSTRES");
    const idxBebidas = texto.indexOf("BEBIDAS");
    expect(idxSegundos).toBeGreaterThan(-1);
    expect(idxPostres).toBeGreaterThan(idxSegundos);
    expect(idxBebidas).toBeGreaterThan(idxPostres);
    expect(texto).toContain("CRUASANT");
    expect(texto).toContain("TÉ NEGRO");
  });

  it("ticket barra reducido eliminado", () => {
    const comanda = comandaCocinaFixture({ bebidas: [], extras: [], observaciones: [] });
    expect(comandaToTicketBarra(comanda)).toBeNull();
  });

  it("formatea torradas con siglas TORRA DESAYUNO DE y TORRA CARTA DE", () => {
    const comanda = comandaCocinaFixture({
      entrantes: [
        plato({
          id: "t1",
          nombre: "TORRA CARTA DE Escalivada, atún, anchoas y olivas",
          tipo: "carta",
        }),
        plato({
          id: "t2",
          nombre: "TORRA DESAYUNO DE Butifarra con queso, cebolla y pimiento verde",
          tipo: "carta",
        }),
      ],
      primeros: [],
      segundos: [],
      bebidas: [],
    });
    const texto = formatKitchenTicketPlain(comanda, "cocina");
    expect(texto).toContain(
      "(C) TORRA CARTA DE ESCALIVADA, ATÚN, ANCHOAS Y OLIVAS",
    );
    expect(texto).toContain(
      "(C) TORRA DESAYUNO DE BUTIFARRA CON QUESO, CEBOLLA Y PIMIENTO VERDE",
    );
    expect(texto).not.toContain("(GRANDE)");
    expect(texto).not.toContain("(DESAYUNO)");
  });

  it("normaliza torradas legacy en ticket", () => {
    const comanda = comandaCocinaFixture({
      entrantes: [
        plato({
          id: "tl1",
          nombre: "Torrada Escalivada, atún, anchoas y olivas (grande)",
          tipo: "carta",
        }),
      ],
      primeros: [],
      segundos: [],
      bebidas: [],
    });
    const texto = formatKitchenTicketPlain(comanda, "cocina");
    expect(texto).toContain(
      "(C) TORRA CARTA DE ESCALIVADA, ATÚN, ANCHOAS Y OLIVAS",
    );
  });

  it("formatea bocadillos en línea con siglas BOC y mods con +", () => {
    const comanda = comandaCocinaFixture({
      entrantes: [
        plato({
          id: "b1",
          nombre: "1/2 BOC Bacon",
          tipo: "carta",
          modificaciones: ["QUESO", "CEBOLLA FRITA", "PIM VERDE"],
        }),
        plato({
          id: "b2",
          nombre: "BOC Lomo",
          tipo: "carta",
          modificaciones: ["QUESO"],
        }),
      ],
      primeros: [],
      segundos: [],
      bebidas: [],
    });
    const texto = formatKitchenTicketPlain(comanda, "cocina");
    expect(texto).toContain(
      "(C) 1/2 BOC BACON + QUESO + CEBOLLA FRITA + PIM VERDE",
    );
    expect(texto).toContain("(C) BOC LOMO + QUESO");
    expect(texto).not.toContain(" - QUESO");
  });

  it("platos repetidos con mods distintas agregan cantidad por mod", () => {
    const comanda = comandaCocinaFixture({
      entrantes: [],
      primeros: [],
      segundos: [
        plato({
          id: "h1",
          nombre: "Hamburguesa Angus",
          tipo: "carta",
          modificaciones: ["Muy hecho"],
        }),
        plato({
          id: "h2",
          nombre: "Hamburguesa Angus",
          tipo: "carta",
          modificaciones: ["Poco hecho"],
        }),
      ],
      bebidas: [],
    });
    const texto = formatKitchenTicketPlain(comanda, "cocina");
    expect(texto).toContain("2 HAMBURGUESAS ANGUS");
    expect(texto).not.toContain("#1");
    expect(texto).not.toContain("#2");
    expect(texto).toContain(" - 1 MUY HECHO");
    expect(texto).toContain(" - 1 POCO HECHO");
  });

  it("agrupa mods con cantidad cuando hay varias unidades", () => {
    const comanda = comandaCocinaFixture({
      entrantes: [
        plato({
          id: "e1",
          nombre: "Ensalada queso fresco, tomate, lechuga, maíz y olivas negras",
          cantidad: 2,
          modificaciones: ["Champiñones"],
        }),
        plato({
          id: "e2",
          nombre: "Ensalada queso fresco, tomate, lechuga, maíz y olivas negras",
          cantidad: 1,
          modificaciones: ["Patatas fritas"],
        }),
      ],
      primeros: [],
      segundos: [],
      bebidas: [],
    });
    const texto = formatKitchenTicketPlain(comanda, "cocina");
    expect(texto).toContain("3 ENSALADAS");
    expect(texto).not.toContain("#1");
    expect(texto).not.toContain("#3");
    expect(texto).toContain(" - 2 CHAMPIÑONES");
    expect(texto).toContain(" - 1 PATATAS FRITAS");
  });
});
