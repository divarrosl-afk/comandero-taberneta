import {
  formatoTorradaCarta,
  formatoTorradaDesayuno,
  parseNombreTorrada,
  rellenoTorrada,
} from "@/lib/carta/torradas-grid";
import { normalizarNombreCatalogo } from "@/lib/catalogo/catalogo-clave";
import type { ProductoCatalogo } from "@/types/catalogo";

const BOC_LEGACY_MEDIO = /^bocadillo\s+(.+?)\s*\(medio\)$/i;
const BOC_LEGACY_GRANDE = /^bocadillo\s+(.+?)\s*\(grande\)$/i;
const TORRADA_LEGACY_DESAYUNO = /^torrada\s+(.+?)\s*\(desayuno\)$/i;
const TORRADA_LEGACY_GRANDE = /^torrada\s+(.+?)\s*\(grande\)$/i;

function nombresDefectoSet(defectos: ProductoCatalogo[]): Set<string> {
  return new Set(defectos.map((d) => normalizarNombreCatalogo(d.nombre)));
}

/** Nombre canónico actual (BOC / TORRA) para emparejar legacy con defaults. */
export function resolverNombreCanonico(
  producto: Pick<ProductoCatalogo, "nombre" | "categoriaCarta">,
  nombresDefecto: Set<string>,
): string {
  const nombre = producto.nombre.trim();
  if (!nombre) return nombre;

  if (/^1\/2\s+BOC\s+/i.test(nombre) || /^BOC\s+/i.test(nombre)) {
    return nombre;
  }

  const torrada = parseNombreTorrada(nombre);
  if (torrada) {
    return torrada.variante === "desayuno"
      ? formatoTorradaDesayuno(torrada.relleno)
      : formatoTorradaCarta(torrada.relleno);
  }

  const bocMedio = nombre.match(BOC_LEGACY_MEDIO);
  if (bocMedio) return `1/2 BOC ${bocMedio[1]!.trim()}`;

  const bocGrande = nombre.match(BOC_LEGACY_GRANDE);
  if (bocGrande) return `BOC ${bocGrande[1]!.trim()}`;

  const torrDesayuno = nombre.match(TORRADA_LEGACY_DESAYUNO);
  if (torrDesayuno) {
    return formatoTorradaDesayuno(rellenoTorrada(torrDesayuno[1]!.trim()));
  }

  const torrGrande = nombre.match(TORRADA_LEGACY_GRANDE);
  if (torrGrande) {
    return formatoTorradaCarta(rellenoTorrada(torrGrande[1]!.trim()));
  }

  if (producto.categoriaCarta?.startsWith("bocadillo")) {
    const medio = `1/2 BOC ${nombre}`;
    const grande = `BOC ${nombre}`;
    if (nombresDefecto.has(normalizarNombreCatalogo(medio))) return medio;
    if (nombresDefecto.has(normalizarNombreCatalogo(grande))) return grande;
  }

  if (producto.categoriaCarta === "torradas") {
    const relleno = rellenoTorrada(nombre);
    const carta = formatoTorradaCarta(relleno);
    const desayuno = formatoTorradaDesayuno(relleno);
    if (nombresDefecto.has(normalizarNombreCatalogo(carta))) return carta;
    if (nombresDefecto.has(normalizarNombreCatalogo(desayuno))) return desayuno;
  }

  if (producto.categoriaCarta === "hamburguesas") {
    if (/^hamburguesa\b/i.test(nombre)) return nombre;
    const conPrefijo = `Hamburguesa ${nombre}`;
    if (nombresDefecto.has(normalizarNombreCatalogo(conPrefijo))) {
      return conPrefijo;
    }
  }

  return nombre;
}

export function esProductoLegacyObsoleto(
  producto: ProductoCatalogo,
  defectos: ProductoCatalogo[],
): boolean {
  const nombres = nombresDefectoSet(defectos);
  const canon = resolverNombreCanonico(producto, nombres);
  return (
    canon !== producto.nombre.trim() &&
    nombres.has(normalizarNombreCatalogo(canon))
  );
}

export function claveEmparejarCatalogo(
  producto: Pick<ProductoCatalogo, "nombre" | "categoriaCarta">,
  nombresDefecto: Set<string>,
): string {
  const canon = resolverNombreCanonico(producto, nombresDefecto);
  return `${producto.categoriaCarta ?? ""}|${normalizarNombreCatalogo(canon)}`;
}

export function claveCanonicaProducto(
  producto: ProductoCatalogo,
  defectos: ProductoCatalogo[],
): string {
  const nombres = nombresDefectoSet(defectos);
  return claveEmparejarCatalogo(producto, nombres);
}

/** IDs a eliminar: legacy renombrado + duplicados de la misma clave canónica. */
export function idsProductosCatalogoObsoletos(
  existentes: ProductoCatalogo[],
  defectos: ProductoCatalogo[],
): string[] {
  const nombres = nombresDefectoSet(defectos);
  const eliminar = new Set<string>();

  for (const p of existentes) {
    if (esProductoLegacyObsoleto(p, defectos)) {
      eliminar.add(p.id);
    }
  }

  const porClave = new Map<string, ProductoCatalogo[]>();
  for (const p of existentes) {
    if (eliminar.has(p.id)) continue;
    const clave = claveEmparejarCatalogo(p, nombres);
    const grupo = porClave.get(clave) ?? [];
    grupo.push(p);
    porClave.set(clave, grupo);
  }

  for (const grupo of porClave.values()) {
    if (grupo.length <= 1) continue;
    const ordenados = [...grupo].sort((a, b) => {
      const aCanon = nombres.has(normalizarNombreCatalogo(a.nombre)) ? 0 : 1;
      const bCanon = nombres.has(normalizarNombreCatalogo(b.nombre)) ? 0 : 1;
      if (aCanon !== bCanon) return aCanon - bCanon;
      return a.orden - b.orden;
    });
    for (const dup of ordenados.slice(1)) {
      eliminar.add(dup.id);
    }
  }

  return [...eliminar];
}

export function legaciesPorClaveCanonica(
  existentes: ProductoCatalogo[],
  defectos: ProductoCatalogo[],
): Map<string, ProductoCatalogo[]> {
  const nombres = nombresDefectoSet(defectos);
  const map = new Map<string, ProductoCatalogo[]>();
  for (const p of existentes) {
    if (!esProductoLegacyObsoleto(p, defectos)) continue;
    const clave = claveEmparejarCatalogo(p, nombres);
    const list = map.get(clave) ?? [];
    list.push(p);
    map.set(clave, list);
  }
  return map;
}
