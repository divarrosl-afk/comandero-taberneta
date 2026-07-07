import { describe, expect, it } from "vitest";
import { crearPlatoVacio } from "@/lib/comanda/plato-factory";
import {
  formEsValido,
  formTieneContenido,
  formTieneExtras,
  formToComanda,
} from "@/lib/comanda/map-form";
import type { ComandaFormState } from "@/types/comanda";

function formBase(overrides: Partial<ComandaFormState> = {}): ComandaFormState {
  return {
    mesa: "12",
    camareroId: null,
    entrantes: [crearPlatoVacio()],
    primeros: [crearPlatoVacio()],
    segundos: [crearPlatoVacio()],
    bebidas: [crearPlatoVacio()],
    extras: [],
    observaciones: [""],
    ...overrides,
  };
}

describe("map-form validación", () => {
  it("acepta comanda solo con extras", () => {
    const form = formBase({
      extras: [{ id: "vasos", nombre: "Vasos", cantidad: 2 }],
    });

    expect(formTieneExtras(form)).toBe(true);
    expect(formTieneContenido(form)).toBe(true);
    expect(formEsValido(form)).toBe(true);
  });

  it("acepta comanda solo con bebidas", () => {
    const bebida = { ...crearPlatoVacio(), nombre: "Coca-Cola" };
    const form = formBase({ bebidas: [bebida] });

    expect(formEsValido(form)).toBe(true);
  });

  it("rechaza comanda sin mesa aunque tenga extras", () => {
    const form = formBase({
      mesa: null,
      extras: [{ id: "copas", nombre: "Copas", cantidad: 1 }],
    });

    expect(formEsValido(form)).toBe(false);
  });

  it("tolera borradores antiguos sin array extras", () => {
    const form = formBase();
    delete (form as Partial<ComandaFormState>).extras;

    expect(formTieneExtras(form)).toBe(false);

    const conExtra = {
      ...form,
      extras: [{ id: "cuenta_efectivo", nombre: "Cuenta efectivo", cantidad: 1 }],
    };
    expect(formEsValido(conExtra)).toBe(true);
  });

  it("incluye extras en formToComanda", () => {
    const form = formBase({
      extras: [{ id: "servilletas", nombre: "Servilletas", cantidad: 3 }],
    });

    const comanda = formToComanda(form);
    expect(comanda?.extras).toEqual([{ nombre: "Servilletas", cantidad: 3 }]);
  });
});
