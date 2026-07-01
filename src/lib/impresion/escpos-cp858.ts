/**
 * Codifica texto Unicode a bytes CP858 para impresoras ESC/POS.
 * Sin dependencias externas — cubre español + símbolos de restaurante.
 */

/** Overrides Unicode → byte CP858 cuando difiere de Latin-1 */
const UNICODE_TO_CP858: Readonly<Record<number, number>> = {
  0x20ac: 0xd5, // €
};

export function encodeToCp858(text: string): Buffer {
  const bytes = new Uint8Array(text.length);
  let len = 0;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 0x80) {
      bytes[len++] = code;
      continue;
    }
    const mapped = UNICODE_TO_CP858[code];
    if (mapped !== undefined) {
      bytes[len++] = mapped;
      continue;
    }
    if (code <= 0xff) {
      bytes[len++] = code;
      continue;
    }
    bytes[len++] = 0x3f; // ?
  }

  return Buffer.from(bytes.subarray(0, len));
}
