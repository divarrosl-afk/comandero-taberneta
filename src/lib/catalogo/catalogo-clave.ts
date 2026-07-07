import type { ProductoCatalogo } from "@/types/catalogo";

export function normalizarNombreCatalogo(nombre: string): string {
  return nombre
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Clave estable para emparejar productos del catálogo por defecto con Supabase. */
export function claveProductoCatalogo(producto: {
  nombre: string;
  seccion: ProductoCatalogo["seccion"];
  categoriaCarta?: ProductoCatalogo["categoriaCarta"];
}): string {
  const categoria = producto.categoriaCarta ?? "";
  return `${producto.seccion}|${categoria}|${normalizarNombreCatalogo(producto.nombre)}`;
}
