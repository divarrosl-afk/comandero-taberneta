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

  if (producto.categoriaCarta?.startsWith("bocadillo")) {
    fields.tipoSeleccion = "carta";
  }

  const aplicaMenu =
    opts.seccion === "primeros" || opts.seccion === "segundos";
  const esImportadoPdf = producto.id.startsWith("menu-imp-");
  const enMenu =
    aplicaMenu &&
    (esImportadoPdf ||
      productoEnMenuHoy(
        producto,
        opts.menu,
        opts.seccion as "primeros" | "segundos",
      ));

  const puedeMenu =
    producto.tipo === "menu-dia" ||
    producto.tipo === "ambos" ||
    enMenu;

  if (enMenu && opts.menu?.activo) {
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
  } else if (
    (producto.tipo === "carta" || producto.tipo === "ambos") &&
    aplicaMenu
  ) {
    fields.tipoSeleccion = "carta";
  } else if (producto.suplemento && aplicaMenu) {
    fields.tipoSeleccion = "menu_suplemento";
    fields.suplemento = producto.suplemento;
  }

  return fields;
}
