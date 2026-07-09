import type { ProductoCatalogo } from "@/types/catalogo";

export interface FilaTorrada {
  relleno: string;
  desayuno?: ProductoCatalogo;
  carta?: ProductoCatalogo;
}

const RE_DESAYUNO = /^TORRA\s+DESAYUNO\s+DE\s+(.+)$/i;
const RE_CARTA = /^TORRA\s+CARTA\s+DE\s+(.+)$/i;
const LEGACY_DESAYUNO = /^torrada\s+(.+?)\s*\(desayuno\)$/i;
const LEGACY_GRANDE = /^torrada\s+(.+?)\s*\(grande\)$/i;
const LEGACY_DESAYUNO_SIMPLE = /^DESAYUNO\s+(.+)$/i;
const LEGACY_TORRADA_SIMPLE = /^TORRADA\s+(.+)$/i;

export function rellenoTorrada(nombre: string): string {
  return nombre.replace(/^torrada\s+de\s+/i, "").trim() || nombre.trim();
}

export function formatoTorradaDesayuno(relleno: string): string {
  return `TORRA DESAYUNO DE ${rellenoTorrada(relleno)}`;
}

export function formatoTorradaCarta(relleno: string): string {
  return `TORRA CARTA DE ${rellenoTorrada(relleno)}`;
}

export function esCategoriaTorrada(
  categoria: ProductoCatalogo["categoriaCarta"],
): boolean {
  return categoria === "torradas";
}

export function parseNombreTorrada(
  nombre: string,
): { variante: "desayuno" | "carta"; relleno: string } | null {
  const trimmed = nombre.trim();
  const desayuno = trimmed.match(RE_DESAYUNO);
  if (desayuno) return { variante: "desayuno", relleno: desayuno[1]!.trim() };
  const carta = trimmed.match(RE_CARTA);
  if (carta) return { variante: "carta", relleno: carta[1]!.trim() };
  const legacyDesayuno = trimmed.match(LEGACY_DESAYUNO);
  if (legacyDesayuno) {
    return { variante: "desayuno", relleno: legacyDesayuno[1]!.trim() };
  }
  const legacyGrande = trimmed.match(LEGACY_GRANDE);
  if (legacyGrande) return { variante: "carta", relleno: legacyGrande[1]!.trim() };
  const legacyDesayunoSimple = trimmed.match(LEGACY_DESAYUNO_SIMPLE);
  if (legacyDesayunoSimple) {
    return { variante: "desayuno", relleno: legacyDesayunoSimple[1]!.trim() };
  }
  const legacyTorradaSimple = trimmed.match(LEGACY_TORRADA_SIMPLE);
  if (legacyTorradaSimple) {
    return { variante: "carta", relleno: legacyTorradaSimple[1]!.trim() };
  }
  return null;
}

export function normalizarNombreTorrada(nombre: string): string | null {
  const parsed = parseNombreTorrada(nombre);
  if (!parsed) return null;
  if (parsed.variante === "desayuno") {
    return formatoTorradaDesayuno(parsed.relleno);
  }
  return formatoTorradaCarta(parsed.relleno);
}

export function listaUsaGridTorradas(productos: ProductoCatalogo[]): boolean {
  return (
    productos.length > 0 &&
    productos.every(
      (p) =>
        esCategoriaTorrada(p.categoriaCarta) &&
        parseNombreTorrada(p.nombre) !== null,
    )
  );
}

export function agruparTorradas(productos: ProductoCatalogo[]): FilaTorrada[] {
  const map = new Map<string, FilaTorrada>();

  for (const producto of productos) {
    const parsed = parseNombreTorrada(producto.nombre);
    if (!parsed) continue;

    const fila = map.get(parsed.relleno) ?? { relleno: parsed.relleno };
    if (parsed.variante === "desayuno") fila.desayuno = producto;
    else fila.carta = producto;
    map.set(parsed.relleno, fila);
  }

  return [...map.values()].sort((a, b) =>
    a.relleno.localeCompare(b.relleno, "es"),
  );
}
