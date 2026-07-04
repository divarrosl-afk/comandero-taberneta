export interface PlatoMenuParseado {
  nombre: string;
  suplemento?: number;
}

export interface MenuDiaParseado {
  fecha?: string;
  precioMenu?: number;
  primeros: PlatoMenuParseado[];
  segundos: PlatoMenuParseado[];
  observaciones?: string;
}

const SUPLEMENTO_RE = /\(\+\s*(\d+(?:[.,]\d+)?)\s*€\s*\)/i;
const FECHA_RE = /Fecha:\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i;
const PRECIO_MENU_RE = /^(\d+(?:[.,]\d+)?)\s*€/;

/** Repone saltos de línea cuando el PDF viene en una sola línea (unpdf). */
export function reformatMenuPdfTexto(texto: string): string {
  return texto
    .replace(/\s*(Fecha:\s*)/i, "\n$1")
    .replace(/\s*PRIMEROS\s*/i, "\nPRIMEROS\n")
    .replace(/\s*SEGUNDOS\s*/i, "\nSEGUNDOS\n")
    .replace(/\s*\(\+(\d+(?:[.,]\d+)?)\s*€\)/gi, "\n(+$1 €)")
    .replace(/([a-záéíóúñ])\s+([A-ZÁÉ])/g, "$1\n$2")
    .replace(/\s+(EL PRECIO INCLUYE)/i, "\n$1")
    .replace(/\s+(\d+[.,]\d+\s*€)/g, "\n$1")
    .replace(/\s+(IVA incluido)/i, "\n$1")
    .replace(/\s+(Tel[eé]fono)/i, "\n$1")
    .trim();
}

function parseNumero(raw: string): number {
  return Number(raw.replace(",", "."));
}

function extraerSuplemento(texto: string): { nombre: string; suplemento?: number } {
  const match = texto.match(SUPLEMENTO_RE);
  if (!match) return { nombre: texto.trim() };
  const suplemento = parseNumero(match[1]);
  const nombre = texto.replace(SUPLEMENTO_RE, "").trim();
  return { nombre, suplemento };
}

function esLineaIgnorada(linea: string): boolean {
  const t = linea.trim();
  if (!t) return true;
  if (/^LA TABERNETA/i.test(t)) return true;
  if (/^MENÚ\s/i.test(t)) return true;
  if (/^Fecha:/i.test(t)) return true;
  if (/^PRIMEROS$/i.test(t)) return true;
  if (/^SEGUNDOS$/i.test(t)) return true;
  if (/^EL PRECIO INCLUYE/i.test(t)) return true;
  if (/^IVA incluido/i.test(t)) return true;
  if (/^Tel[eé]fono/i.test(t)) return true;
  if (PRECIO_MENU_RE.test(t)) return true;
  if (/^--/.test(t)) return true;
  if (/^\(\+\s*\d+(?:[.,]\d+)?\s*€\s*\)$/i.test(t)) return true;
  return false;
}

function esContinuacion(linea: string, acumulado: string): boolean {
  const t = linea.trim();
  if (/^\(\+\s*\d+/.test(t)) return true;
  if (/^[a-z(]/.test(t)) return true;
  if (/\b(y|de|con|al|la|el|del)\s*$/i.test(acumulado.trim())) return true;
  if (acumulado.trim().endsWith(",")) return true;
  return false;
}

function parsearPlatos(lineas: string[]): PlatoMenuParseado[] {
  const platos: PlatoMenuParseado[] = [];
  let acumulado = "";

  const flush = () => {
    const limpio = acumulado.trim();
    if (!limpio) return;
    const { nombre, suplemento } = extraerSuplemento(limpio);
    if (nombre) platos.push({ nombre, suplemento });
    acumulado = "";
  };

  for (const linea of lineas) {
    if (esLineaIgnorada(linea)) continue;

    const trimmed = linea.trim();
    if (/^\(\+\s*\d+/.test(trimmed)) {
      if (acumulado) flush();
      acumulado = trimmed;
      if (SUPLEMENTO_RE.test(acumulado)) flush();
      continue;
    }

    if (!acumulado) {
      acumulado = linea.trim();
      if (SUPLEMENTO_RE.test(acumulado)) flush();
      continue;
    }

    if (esContinuacion(linea, acumulado)) {
      acumulado = `${acumulado} ${linea.trim()}`;
      if (SUPLEMENTO_RE.test(acumulado)) flush();
      continue;
    }

    flush();
    acumulado = linea.trim();
    if (SUPLEMENTO_RE.test(acumulado)) flush();
  }

  flush();
  return platos;
}

/** Parsea texto de menú del día (PDF La Taberneta o pegado manual). */
export function parseMenuDiaTexto(texto: string): MenuDiaParseado {
  const normalizado = texto.includes("\n")
    ? texto
    : reformatMenuPdfTexto(texto);
  const lineas = normalizado.replace(/\r\n/g, "\n").split("\n");

  const fechaMatch = normalizado.match(FECHA_RE);
  const fecha = fechaMatch
    ? `${fechaMatch[3]}-${fechaMatch[2].padStart(2, "0")}-${fechaMatch[1].padStart(2, "0")}`
    : undefined;

  const precioLinea = [...lineas]
    .reverse()
    .find((l) => PRECIO_MENU_RE.test(l.trim()));
  const precioMenu = precioLinea
    ? parseNumero(precioLinea.trim().match(PRECIO_MENU_RE)![1])
    : undefined;

  const observLinea = lineas.find((l) => /^EL PRECIO INCLUYE/i.test(l.trim()));
  const observaciones = observLinea?.replace(/^EL PRECIO INCLUYE:\s*/i, "").trim();

  const idxPrimeros = lineas.findIndex((l) => /^PRIMEROS$/i.test(l.trim()));
  const idxSegundos = lineas.findIndex((l) => /^SEGUNDOS$/i.test(l.trim()));

  const primeros =
    idxPrimeros >= 0
      ? parsearPlatos(
          lineas.slice(
            idxPrimeros + 1,
            idxSegundos >= 0 ? idxSegundos : lineas.length,
          ),
        )
      : [];

  const segundos =
    idxSegundos >= 0
      ? parsearPlatos(lineas.slice(idxSegundos + 1))
      : [];

  return {
    fecha,
    precioMenu,
    primeros,
    segundos,
    observaciones,
  };
}
