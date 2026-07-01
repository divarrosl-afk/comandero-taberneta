import { createId } from "@/lib/id/create-id";
import type { PlatoFormItem } from "@/types/comanda";

export function crearPlatoVacio(): PlatoFormItem {
  return {
    id: createId(),
    nombre: "",
    cantidad: 1,
    modificaciones: [],
    salsas: [],
  };
}

export function duplicarPlato(plato: PlatoFormItem): PlatoFormItem {
  return {
    ...plato,
    id: createId(),
    salsas: plato.salsas.map((s) => ({ ...s })),
    modificaciones: [...plato.modificaciones],
  };
}

export function platoTieneContenido(plato: PlatoFormItem): boolean {
  return plato.nombre.trim().length > 0;
}
