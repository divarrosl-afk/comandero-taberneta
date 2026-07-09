import { describe, expect, it } from "vitest";
import {
  formEsValido,
  formTieneContenido,
  formTieneContenidoCocina,
  formToComanda,
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
    expect(formToComanda(form)?.extras).toHaveLength(1);
  });

  it("acepta solo observaciones", () => {
    const form = formBase({ observaciones: ["Mesa al fondo"] });
    expect(formEsValido(form)).toBe(true);
    expect(formToComanda(form)?.observaciones).toEqual(["Mesa al fondo"]);
  });

  it("acepta solo postres", () => {
    const form = formBase({
      postres: [{ ...crearPostreVacio(), nombre: "Flan" }],
    });
    expect(formEsValido(form)).toBe(true);
    expect(formTieneContenidoCocina(form)).toBe(false);
    expect(formToComanda(form)).toBeNull();
    expect(formToComandaPostres(form)?.postres).toHaveLength(1);
  });

  it("acepta solo cafés", () => {
    const form = formBase({
      cafes: [{ ...crearPostreVacio(), nombre: "Cortado" }],
    });
    expect(formEsValido(form)).toBe(true);
    expect(formToComandaPostres(form)?.cafes).toHaveLength(1);
  });

  it("detecta contenido mixto cocina + postres", () => {
    const form = formBase({
      bebidas: [{ ...crearPlatoVacio(), nombre: "Cerveza" }],
      postres: [{ ...crearPostreVacio(), nombre: "Tarta" }],
    });
    expect(formTieneContenido(form)).toBe(true);
    expect(formToComanda(form)).not.toBeNull();
    expect(formToComandaPostres(form)).not.toBeNull();
  });
});
