import {
  labelAlergeno,
  labelTipoProducto,
  nombreBoton,
  precioCartaDe,
  type ProductoCatalogo,
} from "@/types/catalogo";
import type { MenuDiaConfig, PlatoMenuDiaImportado } from "@/types/menu-dia";

export function productoEnMenuHoy(
  producto: ProductoCatalogo,
  menu: MenuDiaConfig | null,
  seccion?: "primeros" | "segundos",
): boolean {
  if (!menu?.activo) return false;

  if (producto.id.startsWith("menu-imp-")) return true;

  const enImportados = (lista?: PlatoMenuDiaImportado[]) =>
    lista?.some((p) => p.id === producto.id) ?? false;

  if (seccion === "primeros") {
    return (
      enImportados(menu.primerosImportados) ||
      menu.primerosIds.includes(producto.id)
    );
  }
  if (seccion === "segundos") {
    return (
      enImportados(menu.segundosImportados) ||
      menu.segundosIds.includes(producto.id)
    );
  }
  return (
    enImportados(menu.primerosImportados) ||
    enImportados(menu.segundosImportados) ||
    menu.primerosIds.includes(producto.id) ||
    menu.segundosIds.includes(producto.id)
  );
}

export function resumenPrecioProducto(
  producto: ProductoCatalogo,
  menu: MenuDiaConfig | null,
  enMenu?: boolean,
): string {
  const partes: string[] = [];
  const carta = precioCartaDe(producto);
  if (carta) partes.push(`Carta ${carta}€`);
  if (enMenu && menu?.activo && producto.precioMenu) {
    partes.push(`Menú ${producto.precioMenu}€`);
  } else if (enMenu && menu?.activo) {
    partes.push(`Menú ${menu.precioMenu}€`);
  }
  if (producto.suplemento) partes.push(`Sup. +${producto.suplemento}€`);
  return partes.join(" · ") || "—";
}

export function lineasFichaPlato(
  producto: ProductoCatalogo,
  menu: MenuDiaConfig | null,
  seccion?: "primeros" | "segundos",
): { label: string; valor: string }[] {
  const enMenu = productoEnMenuHoy(producto, menu, seccion);
  const lineas: { label: string; valor: string }[] = [
    { label: "Tipo", valor: labelTipoProducto(producto.tipo) },
    {
      label: "Precio carta",
      valor: precioCartaDe(producto) ? `${precioCartaDe(producto)}€` : "—",
    },
    {
      label: "En menú hoy",
      valor: enMenu && menu?.activo ? `Sí (${menu.precioMenu}€)` : "No",
    },
  ];

  if (producto.suplemento) {
    lineas.push({ label: "Suplemento", valor: `+${producto.suplemento}€` });
  }
  if (producto.descripcionCamarero) {
    lineas.push({ label: "Descripción", valor: producto.descripcionCamarero });
  }
  if (producto.ingredientes.length > 0) {
    lineas.push({
      label: "Ingredientes",
      valor: producto.ingredientes.join(", "),
    });
  }
  if (producto.alergenos.length > 0) {
    lineas.push({
      label: "Alérgenos",
      valor: producto.alergenos.map(labelAlergeno).join(", "),
    });
  }
  if (producto.notasInternas) {
    lineas.push({ label: "Notas", valor: producto.notasInternas });
  }
  if (producto.tiempoPreparacion) {
    lineas.push({
      label: "Tiempo aprox.",
      valor: `${producto.tiempoPreparacion} min`,
    });
  }

  return lineas;
}

export { nombreBoton };
