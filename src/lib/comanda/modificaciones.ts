import { esModToggle } from "@/data/comanda-catalogo";
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

export function totalModificaciones(mods: unknown): number {
  return normalizarModificaciones(mods).reduce((n, m) => n + m.cantidad, 0);
}

/** Toggle mods (sin_*, punto, urgente…) o ciclo x1→x2→x3 en cantidad. */
export function tapModificacionEnLista(
  mods: ModificacionCantidad[],
  mod: ModificacionId,
): ModificacionCantidad[] {
  if (esModToggle(mod)) {
    const tiene = mods.some((m) => m.id === mod);
    if (tiene) return mods.filter((m) => m.id !== mod);
    return [...mods, { id: mod, cantidad: 1 }];
  }

  const existente = mods.find((m) => m.id === mod);
  if (!existente) {
    return [...mods, { id: mod, cantidad: 1 }];
  }

  if (existente.cantidad < 3) {
    return mods.map((m) =>
      m.id === mod ? { ...m, cantidad: m.cantidad + 1 } : m,
    );
  }

  return mods;
}

export function setModificacionCantidadEnLista(
  mods: ModificacionCantidad[],
  mod: ModificacionId,
  cantidad: number,
): ModificacionCantidad[] {
  const resto = mods.filter((m) => m.id !== mod);
  if (cantidad <= 0) return resto;
  return [...resto, { id: mod, cantidad }];
}
