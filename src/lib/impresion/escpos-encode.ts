import type { AnchoPapel } from "@/types/impresora";
import { encodeToCp858 } from "@/lib/impresion/escpos-cp858";
import {
  CHARS_PER_LINE_80MM,
  CMD_ALIGN_LEFT,
  CMD_CODEPAGE_CP858,
  CMD_INIT,
  CMD_LF,
  cutPaper,
  feedAndCutPartial,
} from "@/lib/impresion/escpos-commands";

export const ADVANCED_TEST_TICKET_TEXT = `--------------------------------
LA TABERNETA
TEST ESC/POS

Mesa C1

2 x Coca-Cola

1 x Hamburguesa Angus
  - Sin cebolla
  - Extra queso

TOTAL ............ 24,50 €

Gracias
--------------------------------`;

export function charsPerLine(anchoPapel: AnchoPapel = "80mm"): number {
  return anchoPapel === "58mm" ? 32 : CHARS_PER_LINE_80MM;
}

export function wrapLine(line: string, width: number): string[] {
  if (line.length <= width) return [line];
  const parts: string[] = [];
  let rest = line;
  while (rest.length > width) {
    let breakAt = rest.lastIndexOf(" ", width);
    if (breakAt <= 0) breakAt = width;
    parts.push(rest.slice(0, breakAt).trimEnd());
    rest = rest.slice(breakAt).trimStart();
  }
  if (rest.length > 0) parts.push(rest);
  return parts;
}

function centerLine(line: string, width: number): string {
  const trimmed = line.trim();
  if (!trimmed) return "";
  if (trimmed.length >= width) return trimmed.slice(0, width);
  const pad = Math.floor((width - trimmed.length) / 2);
  return `${" ".repeat(pad)}${trimmed}`;
}

function normalizeSeparator(line: string, width: number): string {
  const t = line.trim();
  if (/^[-=]+$/.test(t)) {
    return "-".repeat(width);
  }
  return line;
}

function isCenteredLine(line: string, index: number): boolean {
  const t = line.trim();
  if (!t) return false;
  if (index === 0) return true;
  if (/^MESA\s/i.test(t)) return true;
  if (/TABERNETA/i.test(t)) return true;
  if (/^TEST ESC\/POS$/i.test(t)) return true;
  if (/^Gracias$/i.test(t)) return true;
  return false;
}

function appendLine(chunks: Buffer[], line: string, width: number): void {
  for (const wrapped of wrapLine(line, width)) {
    chunks.push(encodeToCp858(wrapped));
    chunks.push(CMD_LF);
  }
}

function ticketPreamble(chunks: Buffer[]): void {
  chunks.push(CMD_INIT, CMD_CODEPAGE_CP858, CMD_ALIGN_LEFT);
}

function ticketEpilogue(chunks: Buffer[]): void {
  chunks.push(CMD_LF, CMD_LF, CMD_LF, cutPaper());
}

/** Construye buffer ESC/POS a partir de líneas de texto plano. */
export function buildEscPosBuffer(
  ticketText: string,
  anchoPapel: AnchoPapel = "80mm",
): Buffer {
  const width = charsPerLine(anchoPapel);
  const chunks: Buffer[] = [];
  ticketPreamble(chunks);

  const lines = ticketText.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) {
      chunks.push(CMD_LF);
      continue;
    }

    const line = normalizeSeparator(raw, width);
    const output = isCenteredLine(line, i) ? centerLine(line, width) : line;
    appendLine(chunks, output, width);
  }

  ticketEpilogue(chunks);
  return Buffer.concat(chunks);
}

/** Texto plano → buffer ESC/POS con corte parcial. */
export function encodePlainTicket(
  text: string,
  anchoPapel: AnchoPapel = "80mm",
): Buffer {
  return buildEscPosBuffer(text, anchoPapel);
}

/** Ticket de prueba simple (centrado por software, sin ESC a intercalados). */
export function buildTestTicketBuffer(): Buffer {
  return buildEscPosBuffer("TEST IMPRESORA\n\nLA TABERNETA\n\nOK\n", "80mm");
}

/** Ticket de prueba avanzado — alineación, acentos, euro, líneas largas. */
export function buildAdvancedTestTicketBuffer(): Buffer {
  return buildEscPosBuffer(ADVANCED_TEST_TICKET_TEXT, "80mm");
}

/** Alias operativo — misma ruta que comandas reales. */
export function buildTicketBuffer(
  ticketText: string,
  anchoPapel: AnchoPapel = "80mm",
): Buffer {
  return buildEscPosBuffer(ticketText, anchoPapel);
}

/** Versión legible del buffer (para logs DEBUG). */
export function bufferToDebugText(buffer: Buffer): string {
  const parts: string[] = [];
  let textRun = "";
  for (let i = 0; i < buffer.length; i++) {
    const b = buffer[i];
    if (b === 0x0a) {
      if (textRun) parts.push(textRun);
      parts.push("\n");
      textRun = "";
    } else if (b >= 0x20 && b < 0x7f) {
      textRun += String.fromCharCode(b);
    } else if (b >= 0xa0) {
      textRun += String.fromCharCode(b);
    } else if (b === 0x1b) {
      if (textRun) parts.push(textRun);
      textRun = "";
      parts.push("[ESC]");
      i += 1;
      if (buffer[i] === 0x40) parts.push("@");
      else if (buffer[i] === 0x74) {
        parts.push(` t ${buffer[i + 1] ?? "?"}`);
        i += 1;
      } else if (buffer[i] === 0x61) {
        parts.push(` a ${buffer[i + 1] ?? "?"}`);
        i += 1;
      }
    } else if (b === 0x1d && buffer[i + 1] === 0x56) {
      if (textRun) parts.push(textRun);
      textRun = "";
      const m = buffer[i + 2];
      if (m === 0x42) {
        parts.push(`[GS V feed ${buffer[i + 3] ?? 0} + cut]`);
        i += 3;
      } else {
        parts.push(`[GS V ${m ?? "?"}]`);
        i += 2;
      }
    }
  }
  if (textRun) parts.push(textRun);
  return parts.join("");
}

export { feedAndCutPartial };
