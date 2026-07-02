/** Comandos ESC/POS — térmicas 80 mm (APPPOS / estándar puerto 9100). */

export const ESC = 0x1b;
export const GS = 0x1d;

/** ESC @ — reset impresora */
export const CMD_INIT = Buffer.from([ESC, 0x40]);

/** ESC t 19 — code page CP858 (euro + español) */
export const CMD_CODEPAGE_CP858 = Buffer.from([ESC, 0x74, 19]);

/** ESC a 0 — alineación izquierda */
export const CMD_ALIGN_LEFT = Buffer.from([ESC, 0x61, 0x00]);

/** ESC a 1 — alineación centro */
export const CMD_ALIGN_CENTER = Buffer.from([ESC, 0x61, 0x01]);

/** ESC E 1 — negrita on */
export const CMD_BOLD_ON = Buffer.from([ESC, 0x45, 0x01]);

/** ESC E 0 — negrita off */
export const CMD_BOLD_OFF = Buffer.from([ESC, 0x45, 0x00]);

/** GS ! 0x11 — doble alto y ancho */
export const CMD_DOUBLE_ON = Buffer.from([GS, 0x21, 0x11]);

/** GS ! 0x01 — doble alto (ancho normal) */
export const CMD_DOUBLE_HEIGHT_ON = Buffer.from([GS, 0x21, 0x01]);

/** GS ! 0x00 — tamaño normal */
export const CMD_DOUBLE_OFF = Buffer.from([GS, 0x21, 0x00]);

export const CMD_LF = Buffer.from([0x0a]);

/** GS V 1 — corte parcial */
export const CMD_CUT_PARTIAL = Buffer.from([GS, 0x56, 0x01]);

/** GS V 0 — corte total (reserva) */
export const CMD_CUT_FULL = Buffer.from([GS, 0x56, 0x00]);

/** Líneas en blanco antes del corte — evita recortar bebidas/última sección. */
export const TICKET_FINAL_FEED_LINES = 5;

/** GS V 66 n — avance n líneas + corte parcial */
export function feedAndCutPartial(feedLines = TICKET_FINAL_FEED_LINES): Buffer {
  return Buffer.from([GS, 0x56, 0x42, Math.min(255, Math.max(0, feedLines))]);
}

export const CMD_OPEN_DRAWER = Buffer.from([ESC, 0x70, 0x00, 0x40, 0x50]);

/** Ancho útil papel 80 mm (fuente estándar) */
export const CHARS_PER_LINE_80MM = 48;

export function cutPaper(): Buffer {
  return feedAndCutPartial(TICKET_FINAL_FEED_LINES);
}

export function openDrawer(): Buffer {
  return CMD_OPEN_DRAWER;
}
