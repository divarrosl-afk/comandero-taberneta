import { crearCatalogoCartas } from "@/data/cartas-catalogo";
import type { ProductoCatalogo } from "@/types/catalogo";

/** Incrementar al cambiar la estructura del catálogo por defecto */
export const CATALOGO_VERSION = 8;

/** Catálogo inicial — cartas reales del restaurante */
export function crearCatalogoDefault(): ProductoCatalogo[] {
  return crearCatalogoCartas();
}
