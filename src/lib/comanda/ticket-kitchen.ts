import type { ComandaCocina, PlatoComanda, TipoPlato } from "@/types/comanda";
import { getCodigoMesaComanda, isUuid } from "@/lib/mesas/resolve-mesa";

export { isUuid } from "@/lib/mesas/resolve-mesa";

export const TICKET_WIDTH_80MM = 48;

/** Marcadores internos — el encoder ESC/POS los interpreta; el preview los elimina. */
export const MARK_MESA = "@H@";
export const MARK_CENTER = "@C@";
export const MARK_SEP = "@S@";
export const MARK_SECTION = "@T@";
export const MARK_URGENT = "@U@";
export const MARK_DISH = "@D@";
export const MARK_DETAIL = "@M@";
export const MARK_INDENT = "@I@";

export interface TicketFormatOptions {
  /** Nombre visible de mesa (ej. "12", "C1"). Si no se pasa, se usa comanda.mesa. */
  nombreMesa?: string;
  /** Comensales — solo se imprime si está definido. */
  comensales?: number;
  ancho?: number;
}

const BARRA_EXTRA_RE = /hielo|limón|limon|pan|cubiertos/i;

const INDENT_MOD = " - ";

/** Mayúsculas preservando acentos españoles (Á, É, Ñ…). */
export function toTicketUpper(text: string): string {
  return text.toLocaleUpperCase("es-ES").trim();
}

export function stripTicketMarkers(text: string, width = TICKET_WIDTH_80MM): string {
  return text
    .split("\n")
    .map((line) => {
      if (line === MARK_SEP) return "=".repeat(width);
      const marker = line.match(/^@([A-Za-z])@/)?.[0]?.toUpperCase();
      if (marker === MARK_MESA || marker === MARK_DISH) return line.slice(marker.length);
      if (marker === MARK_CENTER) return line.slice(marker.length);
      if (marker === MARK_SECTION) return line.slice(marker.length);
      if (marker === MARK_URGENT) return line.slice(marker.length) || ">>> URGENTE <<<";
      if (marker === MARK_DETAIL) return line.slice(marker.length);
      if (marker === MARK_INDENT) return line.slice(marker.length);
      return line;
    })
    .join("\n");
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
  const upper = toTicketUpper(nombre);
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

function formatModificacion(label: string, lineWidth = TICKET_WIDTH_80MM): {
  urgente: boolean;
  text?: string;
} {
  const norm = normalizeKey(label);
  if (norm === "urgente") return { urgente: true };
  const full = toTicketUpper(label);
  const prefixLen = INDENT_MOD.length;
  if (full.length + prefixLen <= lineWidth) return { urgente: false, text: full };
  return { urgente: false, text: full };
}

function procesarModificaciones(modificaciones: string[]): {
  urgente: boolean;
  bullets: string[];
} {
  const bullets: string[] = [];
  let urgente = false;

  for (const mod of modificaciones) {
    const { urgente: esUrgente, text } = formatModificacion(mod);
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
    const nombre = toTicketUpper(s.nombre);
    return s.cantidad > 1 ? `${nombre} x${s.cantidad}` : nombre;
  });
}

function prefijoTipo(tipo?: TipoPlato): string {
  if (tipo === "menu" || tipo === "menu_suplemento") return "(M) ";
  if (tipo === "menu_medio") return "(1/2M) ";
  if (tipo === "carta") return "(C) ";
  return "";
}

const BOCADILLO_LEGACY_MEDIO = /^bocadillo\s+(.+?)\s*\(medio\)$/i;
const BOCADILLO_LEGACY_GRANDE = /^bocadillo\s+(.+?)\s*\(grande\)$/i;

export function esNombreBocadillo(nombre: string): boolean {
  const norm = normalizeKey(nombre);
  return (
    norm.startsWith("boc ") ||
    norm.startsWith("1/2 boc ") ||
    BOCADILLO_LEGACY_MEDIO.test(nombre.trim()) ||
    BOCADILLO_LEGACY_GRANDE.test(nombre.trim())
  );
}

function normalizarNombreBocadillo(nombre: string): string {
  const trimmed = nombre.trim();
  const medio = trimmed.match(BOCADILLO_LEGACY_MEDIO);
  if (medio) return `1/2 BOC ${medio[1]!.trim()}`;
  const grande = trimmed.match(BOCADILLO_LEGACY_GRANDE);
  if (grande) return `BOC ${grande[1]!.trim()}`;
  return trimmed;
}

function prefijoTipoBocadillo(tipo?: TipoPlato): string {
  return prefijoTipo(tipo ?? "carta");
}

function formatearModTicket(bullet: string): string {
  const match = bullet.match(/^(.+?)\s+x(\d+)$/i);
  if (match) return `${match[1]!.trim()} x${match[2]}`;
  return bullet.trim();
}

function lineaBocadillo(
  cantidad: number,
  nombre: string,
  tipo: TipoPlato | undefined,
  bullets: string[],
): string {
  const base = toTicketUpper(normalizarNombreBocadillo(nombre));
  const mods = bullets.map(formatearModTicket);
  const cuerpo =
    mods.length > 0
      ? `${prefijoTipoBocadillo(tipo)}${base} + ${mods.join(" + ")}`
      : `${prefijoTipoBocadillo(tipo)}${base}`;

  if (cantidad > 1) {
    return `${MARK_DISH}${cantidad} ${cuerpo}`;
  }
  return `${MARK_DISH}${cuerpo}`;
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
  return `${MARK_DISH}${prefijoTipo(tipo)}${toTicketUpper(nombre)}`;
}

function lineasSuplemento(tipo: TipoPlato | undefined, suplemento?: number): string[] {
  if (!suplemento) return [];
  if (tipo === "carta") return [`${MARK_DETAIL}SUPL. +${suplemento} EUR`];
  return [`${MARK_DETAIL} +${suplemento} EUR`];
}

function lineasBulletsConCantidad(
  bullets: string[],
  cantidad: number,
): string[] {
  return bullets.map((b) => {
    if (cantidad > 1) {
      return `${MARK_DETAIL}${INDENT_MOD}${cantidad} ${b}`;
    }
    return `${MARK_DETAIL}${INDENT_MOD}${b}`;
  });
}

function agregarConteoMods(
  conteo: Map<string, number>,
  bullets: string[],
  unidades: number,
): void {
  for (const bullet of bullets) {
    conteo.set(bullet, (conteo.get(bullet) ?? 0) + unidades);
  }
}

function lineasModsAgregados(conteo: Map<string, number>): string[] {
  return [...conteo.entries()].map(([mod, qty]) =>
    `${MARK_DETAIL}${INDENT_MOD}${qty} ${mod}`,
  );
}

function lineasGrupo(grupo: GrupoImpresion): string[] {
  const lineas: string[] = [];
  const { unidades, nombre, tipo, suplemento } = grupo;
  const total = unidades.length;
  const esBocadillo = esNombreBocadillo(nombre);

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

  if (esBocadillo) {
    if (todasIguales) {
      const u = variantes[0]![0]!;
      lineas.push(lineaBocadillo(total, nombre, tipo, u.bullets));
      lineas.push(...lineasSuplemento(tipo, suplemento));
      if (u.notaLibre) {
        for (const parte of u.notaLibre.split(/\s*[·•]\s*/)) {
          const t = parte.trim();
          if (t) lineas.push(`${MARK_DETAIL}${INDENT_MOD}${toTicketUpper(t)}`);
        }
      }
      return lineas;
    }

    for (const variante of variantes) {
      const u = variante[0]!;
      lineas.push(lineaBocadillo(variante.length, nombre, tipo, u.bullets));
    }
    lineas.push(...lineasSuplemento(tipo, suplemento));
    for (const variante of variantes) {
      const u = variante[0]!;
      if (u.notaLibre) {
        lineas.push(`${MARK_DETAIL}${INDENT_MOD}${toTicketUpper(u.notaLibre)}`);
      }
    }
    return lineas;
  }

  lineas.push(lineaPlatoCantidad(total, nombre, tipo));
  lineas.push(...lineasSuplemento(tipo, suplemento));

  if (todasIguales) {
    const u = variantes[0]![0]!;
    lineas.push(...lineasBulletsConCantidad(u.bullets, total));
    if (u.notaLibre) {
      for (const parte of u.notaLibre.split(/\s*[·•]\s*/)) {
        const t = parte.trim();
        if (t) lineas.push(`${MARK_DETAIL}${INDENT_MOD}${toTicketUpper(t)}`);
      }
    }
    return lineas;
  }

  const conteoMods = new Map<string, number>();

  for (const variante of variantes) {
    const u = variante[0]!;
    agregarConteoMods(conteoMods, u.bullets, variante.length);
  }

  lineas.push(...lineasModsAgregados(conteoMods));

  for (const variante of variantes) {
    const u = variante[0]!;
    if (u.notaLibre) {
      lineas.push(`${MARK_DETAIL}${INDENT_MOD}${toTicketUpper(u.notaLibre)}`);
    }
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
  const lineas = [`${MARK_SECTION}${sectionHeader("OBSERVACIONES", TICKET_WIDTH_80MM)}`, ""];
  for (const o of observaciones) {
    lineas.push(`${MARK_DETAIL}${INDENT_MOD}${toTicketUpper(o)}`);
  }
  lineas.push("");
  return lineas;
}

export function resolveMesaDisplay(
  mesaId: string,
  codigoMesa?: string,
): { titulo: string; subtitulo?: string } {
  const codigo = (codigoMesa ?? mesaId).trim();
  if (!codigo) return { titulo: "—" };

  if (isUuid(codigo) && isUuid(mesaId)) {
    return { titulo: mesaId.slice(0, 8).toUpperCase() };
  }

  if (!isUuid(codigo)) {
    return { titulo: toTicketUpper(codigo) };
  }

  if (!isUuid(mesaId)) {
    return { titulo: toTicketUpper(mesaId) };
  }

  return { titulo: mesaId.slice(0, 8).toUpperCase() };
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
  const codigoMesa = options.nombreMesa ?? getCodigoMesaComanda(comanda);
  const mesa = resolveMesaDisplay(comanda.mesa, codigoMesa);
  const lineas: string[] = [];

  lineas.push(`${MARK_DISH}${mesa.titulo}`);
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

  lineas.push("");
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

    if (destino === "completo") {
      lineas.push(...lineasExtras(comanda.extras, width));
    } else {
      const extrasCocina = comanda.extras.filter((e) => !BARRA_EXTRA_RE.test(e.nombre));
      lineas.push(...lineasExtras(extrasCocina, width));
    }
  }

  if (incluirBarra || destino === "cocina" || destino === "completo") {
    lineas.push(...lineasSeccion("BEBIDAS", comanda.bebidas, width));

    if (destino === "barra") {
      const extrasBarra = comanda.extras.filter((e) => BARRA_EXTRA_RE.test(e.nombre));
      lineas.push(...lineasExtras(extrasBarra, width));
    }
  }

  lineas.push(...lineasObservaciones(comanda.observaciones));

  return lineas.join("\n").trimEnd();
}

export function formatKitchenTicketPlain(
  comanda: ComandaCocina,
  destino: TicketDestino,
  options: TicketFormatOptions = {},
): string {
  return stripTicketMarkers(formatKitchenTicket(comanda, destino, options));
}
