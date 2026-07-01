/** Comandos ESC/POS (térmicas 80mm, puerto 9100). */

export const ESC = 0x1b;
export const GS = 0x1d;

export const CMD_INIT = Buffer.from([ESC, 0x40]);
export const CMD_CUT = Buffer.from([GS, 0x56, 0x00]);
export const CMD_LF = Buffer.from([0x0a]);
export const CMD_ALIGN_LEFT = Buffer.from([ESC, 0x61, 0x00]);
export const CMD_ALIGN_CENTER = Buffer.from([ESC, 0x61, 0x01]);
export const CMD_OPEN_DRAWER = Buffer.from([ESC, 0x70, 0x00, 0x40, 0x50]);

export function cutPaper(): Buffer {
  return CMD_CUT;
}

export function openDrawer(): Buffer {
  return CMD_OPEN_DRAWER;
}
