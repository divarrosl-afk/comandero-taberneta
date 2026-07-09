import { platoFieldsFromProducto } from "@/lib/carta/plato-from-producto";
import { crearPlatoVacio } from "@/lib/comanda/plato-factory";
import type { ProductoCatalogo } from "@/types/catalogo";
import type { MenuDiaConfig } from "@/types/menu-dia";
import type { PlatoFormItem, SeccionPlatos } from "@/types/comanda";
import type { PostreFormItem } from "@/types/postres";

export function claveSesionPlatoEditor(
  modo: "nuevo" | "editar",
  productoId?: string,
  platoId?: string,
): string | null {
  if (modo === "nuevo" && productoId) return `nuevo:${productoId}`;
  if (modo === "editar" && platoId) return `editar:${platoId}`;
  return null;
}

export function claveSesionPostreEditor(postreId?: string): string | null {
  return postreId ? `postre:${postreId}` : null;
}

export function platoBaseDesdeProducto(
  producto: ProductoCatalogo,
  seccion: SeccionPlatos,
  menu: MenuDiaConfig | null,
): PlatoFormItem {
  const base = platoFieldsFromProducto(producto, { seccion, menu });
  return {
    ...crearPlatoVacio(),
    ...base,
    nombre: producto.nombre,
  };
}

export function platoBaseEditor(
  modo: "nuevo" | "editar",
  opts: {
    producto?: ProductoCatalogo;
    plato?: PlatoFormItem;
    seccion: SeccionPlatos;
    menu: MenuDiaConfig | null;
  },
): PlatoFormItem {
  if (opts.modo === "nuevo" && opts.producto) {
    return platoBaseDesdeProducto(opts.producto, opts.seccion, opts.menu);
  }
  if (opts.plato) return { ...opts.plato };
  return crearPlatoVacio();
}

export function postreBaseEditor(postre: PostreFormItem): PostreFormItem {
  return { ...postre };
}
