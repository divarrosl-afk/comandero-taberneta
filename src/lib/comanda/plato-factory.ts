import type { PlatoFormItem } from "@/types/comanda";

export function crearPlatoVacio(): PlatoFormItem {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    cantidad: 1,
    modificaciones: [],
    salsas: [],
  };
}

export function duplicarPlato(plato: PlatoFormItem): PlatoFormItem {
  return {
    ...plato,
    id: crypto.randomUUID(),
    salsas: plato.salsas.map((s) => ({ ...s })),
    modificaciones: [...plato.modificaciones],
  };
}

export function platoTieneContenido(plato: PlatoFormItem): boolean {
  return plato.nombre.trim().length > 0;
}
