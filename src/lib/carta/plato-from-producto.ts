import { productoEnMenuHoy } from "@/lib/carta/format-producto";
import type { ProductoCatalogo } from "@/types/catalogo";
import type { MenuDiaConfig } from "@/types/menu-dia";
import type { PlatoFormItem, SeccionPlatos } from "@/types/comanda";

export function platoFieldsFromProducto(
  producto: ProductoCatalogo,
  opts: {
    seccion: SeccionPlatos;
    menu: MenuDiaConfig | null;
  },
): Partial<PlatoFormItem> {
  const fields: Partial<PlatoFormItem> = {
    nombre: producto.nombre,
  };

  const aplicaMenu =
    opts.seccion === "primeros" || opts.seccion === "segundos";
  const enMenu =
    aplicaMenu &&
    productoEnMenuHoy(
      producto,
      opts.menu,
      opts.seccion as "primeros" | "segundos",
    );

  const puedeMenu =
    producto.tipo === "menu-dia" || producto.tipo === "ambos";
  const puedeCarta =
    producto.tipo === "carta" || producto.tipo === "ambos";

  if (enMenu && puedeMenu && opts.menu?.activo) {
    const suplemento =
      producto.suplemento ??
      (opts.seccion === "primeros"
        ? opts.menu.suplementoPrimeros
        : opts.menu.suplementoSegundos);

    if (suplemento && suplemento > 0) {
      fields.tipoSeleccion = "menu_suplemento";
      fields.suplemento = suplemento;
    } else {
      fields.tipoSeleccion = "menu";
    }
  } else if (puedeCarta && aplicaMenu) {
    fields.tipoSeleccion = "carta";
  } else if (producto.suplemento && aplicaMenu) {
    fields.tipoSeleccion = "menu_suplemento";
    fields.suplemento = producto.suplemento;
  }

  return fields;
}
