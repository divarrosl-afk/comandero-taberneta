import type { ComandaCocina, PlatoComanda, TipoPlato } from "@/types/comanda";

export const TICKET_WIDTH_80MM = 48;

/** Marcadores internos — el encoder ESC/POS los interpreta; el preview los elimina. */
export const MARK_CENTER = "@C@";
export const MARK_SEP = "@S@";
export const MARK_SECTION = "@T@";
export const MARK_URGENT = "@U@";
export const MARK_DISH = "@D@";
export const MARK_INDENT = "@I@";

export interface TicketFormatOptions {
  /** Nombre visible de mesa (ej. "12", "C1"). Si no se pasa, se usa comanda.mesa. */
  nombreMesa?: string;
  /** Comensales — solo se imprime si está definido. */
  comensales?: number;
  ancho?: number;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MOD_ABBR: Record<string, string> = {
  "sin lactosa": "SL",
  "sin gluten": "SG",
  "muy hecho": "MH",
  "poco hecho": "PC",
  "sin cebolla": "SR",
  "sin ajo": "SA",
  "sin queso": "Q",
  "sin salsa": "SS",
  "salsa aparte": "SP",
  "al punto": "AP",
  "compartir": "COMP",
  "para llevar": "P/LLEVAR",
  "niños": "NIÑOS",
  "ninos": "NIÑOS",
};

const BARRA_EXTRA_RE = /hielo|limón|limon|pan|cubiertos/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function stripTicketMarkers(text: string): string {
  return text
    .replace(/@C@/g, "")
    .replace(/@S@/g, "")
    .replace(/@T@/g, "")
    .replace(/@U@/g, "")
    .replace(/@D@/g, "")
    .replace(/@I@/g, "   ");
}

export function centerText(text: string, width: number): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (trimmed.length >= width) return trimmed.slice(0, width);
  const pad = Math.floor((width - trimmed.length) / 2);
  return `${" ".repeat(pad)}${trimmed}`;
}

export function sectionHeader(title: string, width: number): string {
  const label = title.toUpperCase();
  const inner = ` ${label} `;
  const fill = Math.max(2, Math.floor((width - inner.length) / 2));
  const line = `${"=".repeat(fill)}${inner}${"=".repeat(fill)}`;
  if (line.length < width) return line + "=".repeat(width - line.length);
  return line.slice(0, width);
}

const NO_PLURAL_PRIMERA: Set<string> = new Set(["PAN"]);

function pluralizarPalabra(palabra: string): string {
  if (/[SZ]$/i.test(palabra)) return `${palabra}ES`;
  if (/[AEIOUÁÉÍÓÚ]$/i.test(palabra)) return `${palabra}S`;
  return `${palabra}S`;
}

function pluralizarNombre(nombre: string, cantidad: number): string {
  const upper = nombre.toUpperCase().trim();
  if (cantidad <= 1) return upper;

  const palabras = upper.split(/\s+/);
  if (palabras.length === 1) return pluralizarPalabra(palabras[0]!);

  const primera = palabras[0]!;
  if (NO_PLURAL_PRIMERA.has(primera)) return upper;

  palabras[0] = pluralizarPalabra(primera);
  return palabras.join(" ");
}

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function abreviarModificacion(label: string): { urgente: boolean; text?: string } {
  const norm = normalizeKey(label);
  if (norm === "urgente") return { urgente: true };
  const abbr = MOD_ABBR[norm];
  if (abbr) return { urgente: false, text: abbr };
  return { urgente: false, text: label.toUpperCase() };
}

function procesarModificaciones(modificaciones: string[]): {
  urgente: boolean;
  bullets: string[];
} {
  const bullets: string[] = [];
  let urgente = false;

  for (const mod of modificaciones) {
    const { urgente: esUrgente, text } = abreviarModificacion(mod);
    if (esUrgente) {
      urgente = true;
      continue;
    }
    if (text && !bullets.includes(text)) bullets.push(text);
  }

  return { urgente, bullets };
}

function salsasBullets(salsas: PlatoComanda["salsas"]): string[] {
  return salsas.map((s) => {
    const nombre = s.nombre.toUpperCase();
    return s.cantidad > 1 ? `${nombre} x${s.cantidad}` : nombre;
  });
}

function prefijoTipo(tipo?: TipoPlato): string {
  if (tipo === "menu" || tipo === "menu_suplemento") return "(M) ";
  if (tipo === "carta") return "(C) ";
  return "";
}

interface UnidadPlato {
  nombre: string;
  tipo?: TipoPlato;
  suplemento?: number;
  urgente: boolean;
  bullets: string[];
  notaLibre?: string;
}

function expandirPlato(plato: PlatoComanda): UnidadPlato[] {
  const { urgente, bullets: modBullets } = procesarModificaciones(
    plato.modificaciones ?? [],
  );
  const salsaBullets = salsasBullets(plato.salsas ?? []);
  const bullets = [...modBullets, ...salsaBullets];
  const nota = plato.notaLibre?.trim() || undefined;
  const cantidad = Math.max(1, plato.cantidad);

  return Array.from({ length: cantidad }, () => ({
    nombre: plato.nombre.trim(),
    tipo: plato.tipo,
    suplemento: plato.suplemento,
    urgente,
    bullets,
    notaLibre: nota,
  }));
}

function firmaUnidad(u: UnidadPlato): string {
  return [
    normalizeKey(u.nombre),
    u.tipo ?? "",
    String(u.suplemento ?? ""),
    u.bullets.join("|"),
    normalizeKey(u.notaLibre ?? ""),
  ].join("::");
}

function firmaBase(u: UnidadPlato): string {
  return [normalizeKey(u.nombre), u.tipo ?? "", String(u.suplemento ?? "")].join(
    "::",
  );
}

interface GrupoImpresion {
  nombre: string;
  tipo?: TipoPlato;
  suplemento?: number;
  unidades: UnidadPlato[];
}

function agruparUnidades(unidades: UnidadPlato[]): GrupoImpresion[] {
  const map = new Map<string, GrupoImpresion>();

  for (const u of unidades) {
    const key = firmaBase(u);
    const grupo = map.get(key);
    if (grupo) {
      grupo.unidades.push(u);
    } else {
      map.set(key, {
        nombre: u.nombre,
        tipo: u.tipo,
        suplemento: u.suplemento,
        unidades: [u],
      });
    }
  }

  return [...map.values()];
}

function lineaPlatoCantidad(
  cantidad: number,
  nombre: string,
  tipo?: TipoPlato,
): string {
  if (cantidad > 1) {
    return `${MARK_DISH}${cantidad} ${pluralizarNombre(nombre, cantidad)}`;
  }
  return `${MARK_DISH}${prefijoTipo(tipo)}${nombre.toUpperCase()}`;
}

function lineasSuplemento(tipo: TipoPlato | undefined, suplemento?: number): string[] {
  if (!suplemento) return [];
  if (tipo === "carta") return [`${MARK_INDENT}SUPL. +${suplemento}€`];
  return [`${MARK_INDENT}+${suplemento}€`];
}

function lineasBullets(bullets: string[]): string[] {
  return bullets.map((b) => `${MARK_INDENT}• ${b}`);
}

function lineasGrupo(grupo: GrupoImpresion): string[] {
  const lineas: string[] = [];
  const { unidades, nombre, tipo, suplemento } = grupo;
  const total = unidades.length;

  const firmas = new Map<string, UnidadPlato[]>();
  for (const u of unidades) {
    const key = firmaUnidad(u);
    const list = firmas.get(key) ?? [];
    list.push(u);
    firmas.set(key, list);
  }

  const variantes = [...firmas.values()];
  const todasIguales = variantes.length === 1;
  const algunaUrgente = unidades.some((u) => u.urgente);

  if (algunaUrgente) {
    lineas.push(`${MARK_URGENT}>>> URGENTE <<<`);
  }

  lineas.push(lineaPlatoCantidad(total, nombre, tipo));
  lineas.push(...lineasSuplemento(tipo, suplemento));

  if (todasIguales) {
    const u = variantes[0]![0]!;
    lineas.push(...lineasBullets(u.bullets));
    if (u.notaLibre) {
      for (const parte of u.notaLibre.split(/\s*[·•]\s*/)) {
        const t = parte.trim();
        if (t) lineas.push(`${MARK_INDENT}• ${t.toUpperCase()}`);
      }
    }
    return lineas;
  }

  let idx = 1;
  for (const variante of variantes) {
    const u = variante[0]!;
    const count = variante.length;
    if (count > 1) {
      lineas.push(`${MARK_INDENT}#${idx}-${idx + count - 1}`);
    } else {
      lineas.push(`${MARK_INDENT}#${idx}`);
    }
    lineas.push(...lineasBullets(u.bullets));
    if (u.notaLibre) lineas.push(`${MARK_INDENT}• ${u.notaLibre.toUpperCase()}`);
    idx += count;
  }

  return lineas;
}

function lineasSeccion(
  titulo: string,
  platos: PlatoComanda[],
  width: number,
): string[] {
  if (!platos.length) return [];

  const lineas: string[] = [`${MARK_SECTION}${sectionHeader(titulo, width)}`, ""];
  const grupos = agruparUnidades(platos.flatMap(expandirPlato));

  for (const grupo of grupos) {
    lineas.push(...lineasGrupo(grupo));
    lineas.push("");
  }

  return lineas;
}

function lineasExtras(
  extras: { nombre: string; cantidad: number }[],
  width: number,
): string[] {
  if (!extras.length) return [];

  const unidades: UnidadPlato[] = extras.flatMap((e) =>
    Array.from({ length: Math.max(1, e.cantidad) }, () => ({
      nombre: e.nombre.trim(),
      urgente: false,
      bullets: [],
    })),
  );

  const lineas: string[] = [`${MARK_SECTION}${sectionHeader("EXTRAS", width)}`, ""];
  for (const grupo of agruparUnidades(unidades)) {
    lineas.push(...lineasGrupo(grupo));
    lineas.push("");
  }
  return lineas;
}

function lineasObservaciones(observaciones: string[]): string[] {
  if (!observaciones.length) return [];
  const lineas = ["OBSERVACIONES MESA", ""];
  for (const o of observaciones) {
    lineas.push(`${MARK_INDENT}• ${o.toUpperCase()}`);
  }
  lineas.push("");
  return lineas;
}

export function resolveMesaDisplay(
  mesaId: string,
  nombreMesa?: string,
): { titulo: string; subtitulo?: string } {
  const nombre = (nombreMesa ?? mesaId).trim();
  const idEsUuid = isUuid(mesaId);
  const nombreEsUuid = isUuid(nombre);

  if (!idEsUuid && !nombreEsUuid) {
    return { titulo: `MESA ${nombre}` };
  }
  if (nombre !== mesaId && !nombreEsUuid) {
    return { titulo: `MESA ${nombre}` };
  }
  if (!nombreEsUuid && nombre) {
    return { titulo: `MESA ${nombre}` };
  }
  return { titulo: "MESA", subtitulo: mesaId.slice(0, 8) };
}

function formatHora(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "";
  }
}

export function formatTicketCabecera(
  comanda: ComandaCocina,
  options: TicketFormatOptions = {},
): string[] {
  const width = options.ancho ?? TICKET_WIDTH_80MM;
  const mesa = resolveMesaDisplay(comanda.mesa, options.nombreMesa);
  const lineas: string[] = [MARK_SEP];

  lineas.push(`${MARK_CENTER}${mesa.titulo}`);
  if (mesa.subtitulo) {
    lineas.push(`${MARK_CENTER}${mesa.subtitulo}`);
  }

  if (options.comensales && options.comensales > 0) {
    const label =
      options.comensales === 1
        ? "1 COMENSAL"
        : `${options.comensales} COMENSALES`;
    lineas.push(`${MARK_CENTER}${label}`);
  }

  const hora = formatHora(comanda.creadaEn);
  if (hora) lineas.push(`${MARK_CENTER}${hora}`);

  lineas.push(MARK_SEP, "");
  return lineas;
}

export type TicketDestino = "cocina" | "barra" | "completo";

export function formatKitchenTicket(
  comanda: ComandaCocina,
  destino: TicketDestino,
  options: TicketFormatOptions = {},
): string {
  const width = options.ancho ?? TICKET_WIDTH_80MM;
  const lineas = [...formatTicketCabecera(comanda, options)];

  const incluirCocina = destino === "cocina" || destino === "completo";
  const incluirBarra = destino === "barra" || destino === "completo";

  if (incluirCocina) {
    lineas.push(...lineasSeccion("ENTRANTES", comanda.entrantes, width));
    lineas.push(...lineasSeccion("PRIMEROS", comanda.primeros, width));
    lineas.push(...lineasSeccion("SEGUNDOS", comanda.segundos, width));

    const extrasCocina = comanda.extras.filter((e) => !BARRA_EXTRA_RE.test(e.nombre));
    lineas.push(...lineasExtras(extrasCocina, width));
  }

  if (incluirBarra) {
    lineas.push(...lineasSeccion("BEBIDAS", comanda.bebidas, width));

    const extrasBarra = comanda.extras.filter((e) => BARRA_EXTRA_RE.test(e.nombre));
    lineas.push(...lineasExtras(extrasBarra, width));
  }

  if (destino === "barra" || destino === "completo") {
    lineas.push(...lineasObservaciones(comanda.observaciones));
  } else if (comanda.observaciones.length) {
    lineas.push(...lineasObservaciones(comanda.observaciones));
  }

  return lineas.join("\n").trimEnd();
}

export function formatKitchenTicketPlain(
  comanda: ComandaCocina,
  destino: TicketDestino,
  options: TicketFormatOptions = {},
): string {
  return stripTicketMarkers(formatKitchenTicket(comanda, destino, options));
}
