import type { ProductoCatalogo } from "@/types/catalogo";
import { productoParaUsoComanda } from "@/lib/carta/carta-admin";
import type { PlatoMenuParseado } from "@/lib/menu-dia/parse-menu-texto";

export type ConfianzaMatch = "alta" | "media" | "baja" | "sin_match";

export interface PlatoMenuMatch {
  parseado: PlatoMenuParseado;
  productoId?: string;
  productoNombre?: string;
  confianza: ConfianzaMatch;
  suplementoCatalogo?: number;
}

export interface MenuDiaMatchResult {
  primeros: PlatoMenuMatch[];
  segundos: PlatoMenuMatch[];
  sinMatch: string[];
}

function normalizarNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\(\d+\s*gr\)/gi, "")
    .replace(/\(\+\s*\d+[^)]*\)/gi, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(nombre: string): Set<string> {
  return new Set(
    normalizarNombre(nombre)
      .split(" ")
      .filter((t) => t.length > 2),
  );
}

function puntuacionMatch(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.size || !tb.size) return 0;

  let comunes = 0;
  for (const t of ta) {
    if (tb.has(t)) comunes++;
  }

  const incluye =
    normalizarNombre(a).includes(normalizarNombre(b)) ||
    normalizarNombre(b).includes(normalizarNombre(a));

  const ratio = comunes / Math.max(ta.size, tb.size);
  return incluye ? Math.max(ratio, 0.85) : ratio;
}

function confianzaDesdeScore(score: number): ConfianzaMatch {
  if (score >= 0.75) return "alta";
  if (score >= 0.5) return "media";
  if (score >= 0.35) return "baja";
  return "sin_match";
}

function mejorMatch(
  plato: PlatoMenuParseado,
  candidatos: ProductoCatalogo[],
): PlatoMenuMatch {
  let mejor: ProductoCatalogo | undefined;
  let mejorScore = 0;

  for (const producto of candidatos) {
    const score = puntuacionMatch(plato.nombre, producto.nombre);
    if (score > mejorScore) {
      mejorScore = score;
      mejor = producto;
    }
  }

  const confianza = confianzaDesdeScore(mejorScore);

  return {
    parseado: plato,
    productoId: confianza === "sin_match" ? undefined : mejor?.id,
    productoNombre: mejor?.nombre,
    confianza,
    suplementoCatalogo: mejor?.suplemento,
  };
}

export function matchMenuConCatalogo(
  primeros: PlatoMenuParseado[],
  segundos: PlatoMenuParseado[],
  productos: ProductoCatalogo[],
): MenuDiaMatchResult {
  const poolPrimeros = productos.filter(
    (p) => p.activo && productoParaUsoComanda(p, "primeros"),
  );
  const poolSegundos = productos.filter(
    (p) => p.activo && productoParaUsoComanda(p, "segundos"),
  );

  const primerosMatch = primeros.map((p) => mejorMatch(p, poolPrimeros));
  const segundosMatch = segundos.map((p) => mejorMatch(p, poolSegundos));

  const sinMatch = [...primerosMatch, ...segundosMatch]
    .filter((m) => m.confianza === "sin_match")
    .map((m) => m.parseado.nombre);

  return { primeros: primerosMatch, segundos: segundosMatch, sinMatch };
}

export function idsDesdeMatch(result: MenuDiaMatchResult): {
  primerosIds: string[];
  segundosIds: string[];
  suplementosProducto: { id: string; suplemento: number }[];
} {
  const ids = (lista: PlatoMenuMatch[]) =>
    lista
      .map((m) => m.productoId)
      .filter((id): id is string => Boolean(id));

  const suplementosProducto: { id: string; suplemento: number }[] = [];

  for (const m of [...result.primeros, ...result.segundos]) {
    if (!m.productoId || !m.parseado.suplemento) continue;
    suplementosProducto.push({
      id: m.productoId,
      suplemento: m.parseado.suplemento,
    });
  }

  return {
    primerosIds: ids(result.primeros),
    segundosIds: ids(result.segundos),
    suplementosProducto,
  };
}
