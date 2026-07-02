import { crearCatalogoCartas } from "@/data/cartas-catalogo";
import type { ProductoCatalogo } from "@/types/catalogo";

/** Catálogo inicial — cartas reales del restaurante */
export function crearCatalogoDefault(): ProductoCatalogo[] {
  return crearCatalogoCartas();
}
