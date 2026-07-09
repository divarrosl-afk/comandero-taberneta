import type { ProductoCatalogo } from "@/types/catalogo";

export interface FilaBocadillo {
  relleno: string;
  medio?: ProductoCatalogo;
  entero?: ProductoCatalogo;
}

const RE_MEDIO = /^1\/2\s+BOC\s+(.+)$/i;
const RE_ENTERO = /^BOC\s+(.+)$/i;

export function esCategoriaBocadillo(
  categoria: ProductoCatalogo["categoriaCarta"],
): boolean {
  return categoria?.startsWith("bocadillo") ?? false;
}

export function esProductoBocadillo(producto: ProductoCatalogo): boolean {
  return esCategoriaBocadillo(producto.categoriaCarta);
}

export function parseNombreBocadillo(
  nombre: string,
): { variante: "medio" | "entero"; relleno: string } | null {
  const trimmed = nombre.trim();
  const medio = trimmed.match(RE_MEDIO);
  if (medio) return { variante: "medio", relleno: medio[1]!.trim() };
  const entero = trimmed.match(RE_ENTERO);
  if (entero) return { variante: "entero", relleno: entero[1]!.trim() };
  return null;
}

export function listaSonBocadillos(productos: ProductoCatalogo[]): boolean {
  return productos.length > 0 && productos.every(esProductoBocadillo);
}

export function agruparBocadillos(
  productos: ProductoCatalogo[],
): FilaBocadillo[] {
  const map = new Map<string, FilaBocadillo>();

  for (const producto of productos) {
    const parsed = parseNombreBocadillo(producto.nombre);
    if (!parsed) continue;

    const fila = map.get(parsed.relleno) ?? { relleno: parsed.relleno };
    if (parsed.variante === "medio") fila.medio = producto;
    else fila.entero = producto;
    map.set(parsed.relleno, fila);
  }

  return [...map.values()].sort((a, b) =>
    a.relleno.localeCompare(b.relleno, "es"),
  );
}
