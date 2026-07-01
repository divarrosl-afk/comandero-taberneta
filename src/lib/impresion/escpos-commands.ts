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

export const CMD_LF = Buffer.from([0x0a]);

/** GS V 1 — corte parcial */
export const CMD_CUT_PARTIAL = Buffer.from([GS, 0x56, 0x01]);

/** GS V 0 — corte total (reserva) */
export const CMD_CUT_FULL = Buffer.from([GS, 0x56, 0x00]);

/** GS V 66 n — avance n líneas + corte parcial */
export function feedAndCutPartial(feedLines = 3): Buffer {
  return Buffer.from([GS, 0x56, 0x42, Math.min(255, Math.max(0, feedLines))]);
}

export const CMD_OPEN_DRAWER = Buffer.from([ESC, 0x70, 0x00, 0x40, 0x50]);

/** Ancho útil papel 80 mm (fuente estándar) */
export const CHARS_PER_LINE_80MM = 48;

export function cutPaper(): Buffer {
  return feedAndCutPartial(3);
}

export function openDrawer(): Buffer {
  return CMD_OPEN_DRAWER;
}
