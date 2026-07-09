import type { ModificacionCantidad, ModificacionId } from "@/types/comanda";

export function normalizarModificaciones(
  mods: unknown,
): ModificacionCantidad[] {
  if (!Array.isArray(mods)) return [];

  return mods.flatMap((mod) => {
    if (typeof mod === "string") {
      return [{ id: mod as ModificacionId, cantidad: 1 }];
    }
    if (
      mod &&
      typeof mod === "object" &&
      "id" in mod &&
      typeof (mod as ModificacionCantidad).id === "string"
    ) {
      const item = mod as ModificacionCantidad;
      return [
        {
          id: item.id,
          cantidad: Math.max(1, item.cantidad ?? 1),
        },
      ];
    }
    return [];
  });
}

export function cantidadModificacion(
  mods: ModificacionCantidad[],
  id: ModificacionId,
): number {
  return mods.find((m) => m.id === id)?.cantidad ?? 0;
}
