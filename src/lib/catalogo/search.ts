import {
  ALERGENOS,
  labelSeccion,
  nombreBoton,
  SECCIONES_CATALOGO,
  type AlergenoId,
  type ProductoCatalogo,
  type SeccionCatalogo,
} from "@/types/catalogo";

export interface BusquedaCatalogoOpciones {
  secciones?: SeccionCatalogo[];
  soloActivos?: boolean;
  limite?: number;
}

export interface GrupoDestacados {
  favoritos: ProductoCatalogo[];
  masVendidos: ProductoCatalogo[];
  recomendados: ProductoCatalogo[];
  resto: ProductoCatalogo[];
}

export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Coincidencia por subcadena o abreviatura tipo teclado rápido ("baca" → Bacalao). */
export function coincideAbreviatura(texto: string, query: string): boolean {
  const t = normalizarTexto(texto);
  const q = normalizarTexto(query);
  if (!q) return true;
  if (t.includes(q)) return true;

  let indice = 0;
  for (const ch of q) {
    const pos = t.indexOf(ch, indice);
    if (pos === -1) return false;
    indice = pos + 1;
  }
  return true;
}

function resolverAlergeno(token: string): AlergenoId | null {
  const t = normalizarTexto(token);
  for (const a of ALERGENOS) {
    if (normalizarTexto(a.id) === t || normalizarTexto(a.label) === t) {
      return a.id;
    }
  }
  return null;
}

export interface FiltroAlergeno {
  tipo: "con" | "sin";
  alergeno: AlergenoId;
}

export function parsearFiltroAlergeno(query: string): FiltroAlergeno | null {
  const n = normalizarTexto(query);
  const match = n.match(/^sin\s+(.+)$/);
  if (!match) return null;
  const alergeno = resolverAlergeno(match[1].trim());
  if (!alergeno) return null;
  return { tipo: "sin", alergeno };
}

function seccionDesdeToken(token: string): SeccionCatalogo | null {
  const t = normalizarTexto(token);
  for (const s of SECCIONES_CATALOGO) {
    if (
      normalizarTexto(s.id) === t ||
      normalizarTexto(s.label) === t ||
      normalizarTexto(s.label).startsWith(t)
    ) {
      return s.id;
    }
  }
  return null;
}

function textoCamposProducto(producto: ProductoCatalogo): string {
  const alergenosTexto = producto.alergenos
    .map((id) => ALERGENOS.find((a) => a.id === id)?.label ?? id)
    .join(" ");

  return normalizarTexto(
    [
      producto.nombre,
      producto.nombreCorto,
      nombreBoton(producto),
      labelSeccion(producto.seccion),
      producto.seccion,
      ...producto.ingredientes,
      alergenosTexto,
      producto.descripcionCamarero,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function tokenCoincideProducto(
  producto: ProductoCatalogo,
  token: string,
): boolean {
  const alergeno = resolverAlergeno(token);
  if (alergeno && producto.alergenos.includes(alergeno)) return true;

  const seccion = seccionDesdeToken(token);
  if (seccion && producto.seccion === seccion) return true;

  if (coincideAbreviatura(producto.nombre, token)) return true;
  if (producto.nombreCorto && coincideAbreviatura(producto.nombreCorto, token)) {
    return true;
  }

  for (const ing of producto.ingredientes) {
    if (coincideAbreviatura(ing, token) || normalizarTexto(ing).includes(token)) {
      return true;
    }
  }

  return textoCamposProducto(producto).includes(token);
}

export function productoCoincideBusqueda(
  producto: ProductoCatalogo,
  query: string,
): boolean {
  const q = query.trim();
  if (!q) return true;

  const filtroSin = parsearFiltroAlergeno(q);
  if (filtroSin?.tipo === "sin") {
    const sinAlergeno = !producto.alergenos.includes(filtroSin.alergeno);
    const nombreIndicaSin = normalizarTexto(producto.nombre).includes(
      `sin ${normalizarTexto(filtroSin.alergeno)}`,
    );
    return sinAlergeno || nombreIndicaSin || normalizarTexto(producto.nombre).includes(normalizarTexto(q));
  }

  const tokens = normalizarTexto(q).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  if (tokens.length === 1) {
    const soloSeccion = seccionDesdeToken(tokens[0]);
    if (soloSeccion) return producto.seccion === soloSeccion;
  }

  return tokens.every((token) => tokenCoincideProducto(producto, token));
}

export function puntuarProductoBusqueda(
  producto: ProductoCatalogo,
  query: string,
  ventas = 0,
): number {
  const q = normalizarTexto(query.trim());
  if (!q) {
    let score = 0;
    if (producto.favorito) score += 100;
    if (producto.recomendado) score += 50;
    score += ventas * 2;
    score -= producto.orden;
    return score;
  }

  let score = 0;
  const nombre = normalizarTexto(producto.nombre);
  const corto = normalizarTexto(producto.nombreCorto ?? "");

  if (nombre === q || corto === q) score += 200;
  else if (nombre.startsWith(q) || corto.startsWith(q)) score += 120;
  else if (coincideAbreviatura(producto.nombre, q)) score += 80;
  else if (producto.nombreCorto && coincideAbreviatura(producto.nombreCorto, q)) {
    score += 70;
  }

  if (producto.favorito) score += 30;
  if (producto.recomendado) score += 20;
  score += ventas;
  score -= producto.orden * 0.1;

  return score;
}

export function ordenarProductosCatalogo(
  productos: ProductoCatalogo[],
  query = "",
  ventasPorId?: Map<string, number>,
): ProductoCatalogo[] {
  const q = query.trim();
  return [...productos].sort((a, b) => {
    const va = ventasPorId?.get(a.id) ?? 0;
    const vb = ventasPorId?.get(b.id) ?? 0;
    const pa = puntuarProductoBusqueda(a, q, va);
    const pb = puntuarProductoBusqueda(b, q, vb);
    if (pb !== pa) return pb - pa;
    if (a.orden !== b.orden) return a.orden - b.orden;
    return a.nombre.localeCompare(b.nombre, "es");
  });
}

export function buscarEnCatalogo(
  productos: ProductoCatalogo[],
  query: string,
  opciones: BusquedaCatalogoOpciones = {},
): ProductoCatalogo[] {
  const { secciones, soloActivos = true, limite } = opciones;
  const q = query.trim();

  let lista = productos.filter((p) => {
    if (soloActivos && !p.activo) return false;
    if (secciones && !secciones.includes(p.seccion)) return false;
    return productoCoincideBusqueda(p, q);
  });

  lista = ordenarProductosCatalogo(lista, q);

  if (limite && limite > 0) {
    lista = lista.slice(0, limite);
  }

  return lista;
}

export function dividirDestacados(
  productos: ProductoCatalogo[],
  ventasPorId: Map<string, number>,
  minVentas = 1,
): GrupoDestacados {
  const vistos = new Set<string>();

  const favoritos = productos.filter((p) => {
    if (!p.favorito || vistos.has(p.id)) return false;
    vistos.add(p.id);
    return true;
  });

  const masVendidos = productos
    .filter((p) => !vistos.has(p.id) && (ventasPorId.get(p.id) ?? 0) >= minVentas)
    .sort(
      (a, b) =>
        (ventasPorId.get(b.id) ?? 0) - (ventasPorId.get(a.id) ?? 0) ||
        a.nombre.localeCompare(b.nombre, "es"),
    )
    .filter((p) => {
      if (vistos.has(p.id)) return false;
      vistos.add(p.id);
      return true;
    });

  const recomendados = productos.filter((p) => {
    if (!p.recomendado || vistos.has(p.id)) return false;
    vistos.add(p.id);
    return true;
  });

  const resto = productos.filter((p) => !vistos.has(p.id));

  return { favoritos, masVendidos, recomendados, resto };
}
