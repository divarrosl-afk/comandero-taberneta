import type { Camarero } from "@/types/comanda";

export const camareros: Camarero[] = [
  { id: "david", nombre: "David", activo: true },
  { id: "ingrid", nombre: "Ingrid", activo: true },
  { id: "cocina", nombre: "Cocina", activo: true },
  { id: "maria", nombre: "María", activo: true },
  { id: "carlos", nombre: "Carlos", activo: true },
  { id: "laura", nombre: "Laura", activo: true },
];

export function getCamareroNombre(id: string | null): string | null {
  if (!id) return null;
  return camareros.find((c) => c.id === id)?.nombre ?? null;
}
