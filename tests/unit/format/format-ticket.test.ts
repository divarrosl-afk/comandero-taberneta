import { describe, expect, it } from "vitest";
import { comandaToTexto } from "@/lib/comanda/format-ticket";
import {
  formatKitchenTicketPlain,
  resolveMesaDisplay,
  sectionHeader,
  stripTicketMarkers,
} from "@/lib/comanda/ticket-kitchen";
import { comandaToTicketBarra, comandaToTicketCocina } from "@/modules/impresion-wifi/format-tickets";
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
  it("comandaToTexto incluye mesa sin camarero en ticket", () => {
    const texto = comandaToTexto(comandaCocinaFixture(), { nombreMesa: "C1" });
    expect(texto).toContain("MESA C1");
    expect(texto).not.toContain("CAMARERO");
    expect(texto).toContain("ENSALADA");
  });

  it("comandaPostresToTexto incluye postres", () => {
    const texto = comandaPostresToTexto(comandaPostresFixture());
    expect(texto).toContain("MESA C1");
    expect(texto).toContain("Flan");
  });
});

describe("ticket-kitchen", () => {
  it("sectionHeader centra título en mayúsculas", () => {
    const line = sectionHeader("ENTRANTES", 48);
    expect(line).toContain("ENTRANTES");
    expect(line).toMatch(/^=+ ENTRANTES =+/);
  });

  it("resolveMesaDisplay usa número de mesa cuando existe", () => {
    expect(resolveMesaDisplay("mesa-uuid-12", "12")).toEqual({ titulo: "MESA 12" });
  });

  it("resolveMesaDisplay muestra UUID corto si no hay nombre", () => {
    const uuid = "b73432dc-a1b2-4c3d-8e9f-123456789abc";
    expect(resolveMesaDisplay(uuid)).toEqual({
      titulo: "MESA",
      subtitulo: "b73432dc",
    });
  });

  it("agrupa entrantes repetidos", () => {
    const texto = formatKitchenTicketPlain(comandaEjemplo(), "cocina", {
      nombreMesa: "12",
      comensales: 4,
    });
    expect(texto).toContain("MESA 12");
    expect(texto).toContain("4 COMENSALES");
    expect(texto).toContain("3 PAN TOMATE");
    expect(texto).toContain("(M) GAZPACHO");
    expect(texto).toContain("(M) BURRATA");
    expect(texto).toContain("+5€");
    expect(texto).toContain("(C) HAMBURGUESA ANGUS");
    expect(texto).toContain(">>> URGENTE <<<");
    expect(texto).toContain("• SL");
    expect(texto).toContain("• MH");
    expect(texto).toContain("• NIÑOS");
    expect(texto).not.toMatch(/Sin lactosa.*Muy hecho/i);
  });

  it("agrupa bebidas en ticket barra", () => {
    const texto = formatKitchenTicketPlain(comandaEjemplo(), "barra", {
      nombreMesa: "12",
    });
    expect(texto).toContain("3 AGUAS");
    expect(texto).toContain("2 REFRESCOS");
    expect(texto).toContain("VINO NEGRO CASA");
    expect(texto).not.toContain("PRIMEROS");
  });

  it("cocina no incluye bebidas", () => {
    const marcado = comandaToTicketCocina(comandaEjemplo(), { nombreMesa: "12" });
    const texto = stripTicketMarkers(marcado);
    expect(texto).not.toContain("3 AGUAS");
    expect(texto).toContain("SEGUNDOS");
  });

  it("barra devuelve null si no hay bebidas ni extras de barra", () => {
    const comanda = comandaCocinaFixture({ bebidas: [], extras: [], observaciones: [] });
    expect(comandaToTicketBarra(comanda)).toBeNull();
  });

  it("platos repetidos con mods distintas muestran #1 y #2", () => {
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
    expect(texto).toContain("#1");
    expect(texto).toContain("#2");
    expect(texto).toContain("• MH");
    expect(texto).toContain("• PC");
  });
});
