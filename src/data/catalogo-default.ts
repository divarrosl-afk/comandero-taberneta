import { crearBebidasBase, crearCartaAlmuerzo } from "@/data/carta-almuerzo";
import type { ProductoCatalogo } from "@/types/catalogo";

/** Catálogo inicial — carta almuerzo real + bebidas base (vinos pendientes) */
export function crearCatalogoDefault(): ProductoCatalogo[] {
  return [...crearCartaAlmuerzo(), ...crearBebidasBase()];
}
