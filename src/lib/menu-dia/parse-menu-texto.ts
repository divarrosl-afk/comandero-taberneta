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
const SOLO_SUPLEMENTO_RE = /^\(\+\s*(\d+(?:[.,]\d+)?)\s*€\s*\)$/i;
const FECHA_RE = /Fecha:\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i;
const PRECIO_MENU_RE = /^(\d+(?:[.,]\d+)?)\s*€/;

/** Repone saltos de línea cuando el PDF viene en una sola línea (unpdf). */
export function reformatMenuPdfTexto(texto: string): string {
  return texto
    .replace(/\s*(Fecha:\s*)/i, "\n$1")
    .replace(/\s*PRIMEROS\s*/i, "\nPRIMEROS\n")
    .replace(/\s*SEGUNDOS\s*/i, "\nSEGUNDOS\n")
    .replace(/\s*\(\+(\d+(?:[.,]\d+)?)\s*€\)/gi, "\n(+$1 €)")
    .replace(/\.\s+([A-ZÁÉÍÓÚÑ])/gu, ".\n$1")
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

function limpiarNombrePlato(nombre: string): string {
  return nombre.trim().replace(/\.$/, "");
}

function extraerSuplemento(texto: string): { nombre: string; suplemento?: number } {
  const match = texto.match(SUPLEMENTO_RE);
  if (!match) return { nombre: limpiarNombrePlato(texto) };
  const suplemento = parseNumero(match[1]);
  const nombre = limpiarNombrePlato(texto.replace(SUPLEMENTO_RE, ""));
  return { nombre, suplemento };
}

function esSoloSuplemento(linea: string): boolean {
  return SOLO_SUPLEMENTO_RE.test(linea.trim());
}

function nombreEsCorto(nombre: string): boolean {
  const t = nombre.trim();
  return t.length > 0 && t.length <= 15 && !/\s/.test(t);
}

function pareceNombrePlatoSimple(nombre: string): boolean {
  if (/\b(de|con|al|del|la|el|los|las)\b/i.test(nombre)) return false;
  return nombre.trim().length <= 30;
}

/** Separa platos distintos que el PDF pegó en una sola línea. */
function splitNombrePlatos(nombre: string): string[] {
  const t = nombre.trim();
  if (!t) return [];

  const porPunto = t.split(/\.\s+(?=[A-ZÁÉÍÓÚÑ])/u);
  if (porPunto.length > 1) {
    return porPunto.flatMap((parte) => splitNombrePlatos(parte.trim()));
  }

  const yMatch = t.match(/^(.+?)\s+y\s+(.+)$/i);
  if (yMatch) {
    const izq = yMatch[1].trim();
    const der = yMatch[2].trim();
    if (pareceNombrePlatoSimple(izq) && pareceNombrePlatoSimple(der)) {
      const derFmt =
        der.charAt(0).toLocaleUpperCase("es") + der.slice(1);
      return [izq, derFmt];
    }
  }

  const dosPalabras = t.match(
    /^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)$/u,
  );
  if (dosPalabras) {
    return [dosPalabras[1], dosPalabras[2]];
  }

  return [t];
}

function expandirLineaPlato(linea: string): string[] {
  const t = linea.trim();
  if (!t) return [];
  if (esSoloSuplemento(t)) return [t];

  const inicioSup = t.match(/^\(\+\s*(\d+(?:[.,]\d+)?)\s*€\s*\)\s*(.+)$/i);
  if (inicioSup) {
    return [`(+${inicioSup[1]} €)`, ...expandirLineaPlato(inicioSup[2])];
  }

  const medio = t.match(/^(.+?)\s*\(\+\s*(\d+(?:[.,]\d+)?)\s*€\s*\)\s+(.+)$/i);
  if (medio) {
    const izq = splitNombrePlatos(medio[1].trim());
    const der = splitNombrePlatos(medio[3].trim());
    const sup = parseNumero(medio[2]);
    const out: string[] = [];

    if (izq.length === 1) {
      out.push(`${izq[0]} (+${sup} €)`);
    } else {
      out.push(...izq.slice(0, -1));
      out.push(`${izq[izq.length - 1]} (+${sup} €)`);
    }
    out.push(...der);
    return out;
  }

  if (SUPLEMENTO_RE.test(t)) {
    const { nombre, suplemento } = extraerSuplemento(t);
    if (nombre && suplemento !== undefined) {
      const partes = splitNombrePlatos(nombre);
      if (partes.length > 1) {
        return [`${partes[0]} (+${suplemento} €)`, ...partes.slice(1)];
      }
    }
  }

  const partes = splitNombrePlatos(t);
  if (partes.length > 1) return partes;
  return [t];
}

function expandirLineasPlatos(lineas: string[]): string[] {
  const out: string[] = [];
  for (const linea of lineas) {
    out.push(...expandirLineaPlato(linea));
  }
  return out;
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
  return false;
}

function esContinuacion(linea: string, acumulado: string): boolean {
  const t = linea.trim();
  const prev = acumulado.trim();
  if (nombreEsCorto(prev) && /^[a-záéíóúñ]/u.test(t)) {
    const primera = t.split(/\s+/)[0] ?? "";
    if (nombreEsCorto(primera) || primera.length <= 15) return false;
  }
  if (/^\(\+\s*\d+/.test(t)) return true;
  if (/^[a-z(]/.test(t)) return true;
  if (/\b(y|de|con|al|la|el|del)\s*$/i.test(acumulado.trim())) return true;
  if (acumulado.trim().endsWith(",")) return true;
  return false;
}

function parsearPlatos(lineas: string[]): PlatoMenuParseado[] {
  const platos: PlatoMenuParseado[] = [];
  let acumulado = "";
  let suplementoPendiente: number | undefined;

  const flush = () => {
    const limpio = acumulado.trim();
    if (!limpio) return;
    const { nombre, suplemento } = extraerSuplemento(limpio);
    const sup = suplemento ?? suplementoPendiente;
    suplementoPendiente = undefined;
    if (nombre) platos.push({ nombre, suplemento: sup });
    acumulado = "";
  };

  for (const linea of expandirLineasPlatos(lineas)) {
    if (esLineaIgnorada(linea)) continue;

    const trimmed = linea.trim();

    if (esSoloSuplemento(trimmed)) {
      const sup = parseNumero(trimmed.match(SOLO_SUPLEMENTO_RE)![1]);
      if (acumulado) flush();

      const anterior = platos[platos.length - 1];
      if (anterior && !anterior.suplemento && nombreEsCorto(anterior.nombre)) {
        anterior.suplemento = sup;
      } else {
        suplementoPendiente = sup;
      }
      continue;
    }

    if (/^\(\+\s*\d+/.test(trimmed)) {
      if (acumulado) flush();
      acumulado = trimmed;
      if (SUPLEMENTO_RE.test(acumulado)) flush();
      continue;
    }

    if (!acumulado) {
      acumulado = trimmed;
      if (SUPLEMENTO_RE.test(acumulado)) flush();
      continue;
    }

    if (esContinuacion(linea, acumulado)) {
      acumulado = `${acumulado} ${trimmed}`;
      if (SUPLEMENTO_RE.test(acumulado)) flush();
      continue;
    }

    flush();
    acumulado = trimmed;
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
