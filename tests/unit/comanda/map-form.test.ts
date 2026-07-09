import { describe, expect, it } from "vitest";
import {
  formEsValido,
  formTieneContenido,
  formTieneContenidoCocina,
  formToComanda,
  formToComandaPanel,
  formToComandaPostres,
} from "@/lib/comanda/map-form";
import { crearPlatoVacio } from "@/lib/comanda/plato-factory";
import { crearPostreVacio } from "@/lib/postres/postre-factory";
import type { ComandaFormState } from "@/types/comanda";

function formBase(overrides: Partial<ComandaFormState> = {}): ComandaFormState {
  return {
    mesa: "mesa-1",
    camareroId: null,
    entrantes: [crearPlatoVacio()],
    primeros: [crearPlatoVacio()],
    segundos: [crearPlatoVacio()],
    bebidas: [crearPlatoVacio()],
    postres: [crearPostreVacio()],
    cafes: [crearPostreVacio()],
    estadoXCafe: null,
    comensales: null,
    extras: [],
    observaciones: [""],
    ...overrides,
  };
}

describe("formEsValido — pedidos parciales", () => {
  it("requiere mesa", () => {
    expect(formEsValido(formBase({ mesa: null }))).toBe(false);
  });

  it("acepta solo bebidas", () => {
    const form = formBase({
      bebidas: [{ ...crearPlatoVacio(), nombre: "Agua" }],
    });
    expect(formEsValido(form)).toBe(true);
    expect(formToComanda(form)?.bebidas).toHaveLength(1);
  });

  it("acepta solo entrantes", () => {
    const form = formBase({
      entrantes: [{ ...crearPlatoVacio(), nombre: "Pan" }],
    });
    expect(formEsValido(form)).toBe(true);
  });

  it("acepta solo extras", () => {
    const form = formBase({
      extras: [{ id: "pan", nombre: "Pan", cantidad: 1 }],
    });
    expect(formEsValido(form)).toBe(true);
    expect(formToComandaPanel(form)?.extras).toHaveLength(1);
  });

  it("acepta solo observaciones", () => {
    const form = formBase({ observaciones: ["Mesa al fondo"] });
    expect(formEsValido(form)).toBe(true);
    expect(formToComandaPanel(form)?.observaciones).toEqual(["Mesa al fondo"]);
  });

  it("acepta solo postres en ticket completo", () => {
    const form = formBase({
      postres: [{ ...crearPostreVacio(), nombre: "Flan" }],
    });
    expect(formEsValido(form)).toBe(true);
    expect(formTieneContenidoCocina(form)).toBe(false);
    expect(formToComandaPanel(form)).toBeNull();
    expect(formToComanda(form)?.postres).toHaveLength(1);
    expect(formToComandaPostres(form)?.postres).toHaveLength(1);
  });

  it("acepta solo cafés en ticket completo (bebidas)", () => {
    const form = formBase({
      cafes: [{ ...crearPostreVacio(), nombre: "Cortado" }],
    });
    expect(formEsValido(form)).toBe(true);
    expect(formToComanda(form)?.bebidas).toHaveLength(1);
    expect(formToComandaPostres(form)?.cafes).toHaveLength(1);
  });

  it("incluye comensales en formToComanda", () => {
    const form = formBase({
      bebidas: [{ ...crearPlatoVacio(), nombre: "Agua" }],
      comensales: 4,
    });
    expect(formToComanda(form)?.comensales).toBe(4);
  });

  it("ticket completo une postres y cafés; panel los separa", () => {
    const form = formBase({
      bebidas: [{ ...crearPlatoVacio(), nombre: "Cerveza" }],
      postres: [{ ...crearPostreVacio(), nombre: "Tarta" }],
      cafes: [{ ...crearPostreVacio(), nombre: "Té negro" }],
    });
    expect(formTieneContenido(form)).toBe(true);
    const ticket = formToComanda(form)!;
    expect(ticket.postres).toHaveLength(1);
    expect(ticket.bebidas.map((b) => b.nombre)).toEqual(["Cerveza", "Té negro"]);

    const panel = formToComandaPanel(form)!;
    expect(panel.bebidas).toHaveLength(1);
    expect(panel.postres).toBeUndefined();
    expect(formToComandaPostres(form)?.cafes).toHaveLength(1);
  });
});
