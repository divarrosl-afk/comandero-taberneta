import type { AnchoPapel } from "@/types/impresora";
import { encodeToCp858 } from "@/lib/impresion/escpos-cp858";
import {
  CHARS_PER_LINE_80MM,
  CMD_ALIGN_CENTER,
  CMD_ALIGN_LEFT,
  CMD_BOLD_OFF,
  CMD_BOLD_ON,
  CMD_CODEPAGE_CP858,
  CMD_DOUBLE_OFF,
  CMD_DOUBLE_ON,
  CMD_INIT,
  CMD_LF,
  cutPaper,
  feedAndCutPartial,
  TICKET_FINAL_FEED_LINES,
} from "@/lib/impresion/escpos-commands";
import {
  MARK_CENTER,
  MARK_DISH,
  MARK_INDENT,
  MARK_SECTION,
  MARK_SEP,
  MARK_URGENT,
} from "@/lib/comanda/ticket-kitchen";

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
    if (breakAt <= 0) {
      const nextSpace = rest.indexOf(" ", width);
      if (nextSpace > 0) {
        parts.push(rest.slice(0, nextSpace).trimEnd());
        rest = rest.slice(nextSpace).trimStart();
        continue;
      }
      breakAt = width;
    }
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
    return "=".repeat(width);
  }
  return line;
}

function isLegacyCenteredLine(line: string, index: number): boolean {
  const t = line.trim();
  if (!t) return false;
  if (index === 0) return true;
  if (/^MESA\s/i.test(t)) return true;
  if (/TABERNETA/i.test(t)) return true;
  if (/^TEST ESC\/POS$/i.test(t)) return true;
  if (/^Gracias$/i.test(t)) return true;
  return false;
}

type LineStyle = {
  center: boolean;
  bold: boolean;
  double: boolean;
  width: number;
};

function parseTicketLine(raw: string, paperWidth: number): { text: string; style: LineStyle } {
  if (raw === MARK_SEP) {
    return {
      text: "=".repeat(paperWidth),
      style: { center: false, bold: false, double: false, width: paperWidth },
    };
  }

  if (raw.startsWith(MARK_CENTER)) {
    return {
      text: raw.slice(MARK_CENTER.length),
      style: { center: true, bold: true, double: false, width: paperWidth },
    };
  }

  if (raw.startsWith(MARK_SECTION)) {
    return {
      text: raw.slice(MARK_SECTION.length),
      style: { center: true, bold: true, double: false, width: paperWidth },
    };
  }

  if (raw.startsWith(MARK_URGENT)) {
    const text = raw.slice(MARK_URGENT.length) || ">>> URGENTE <<<";
    return {
      text,
      style: { center: true, bold: true, double: true, width: Math.floor(paperWidth / 2) },
    };
  }

  if (raw.startsWith(MARK_DISH)) {
    return {
      text: raw.slice(MARK_DISH.length),
      style: { center: false, bold: true, double: true, width: Math.floor(paperWidth / 2) },
    };
  }

  if (raw.startsWith(MARK_INDENT)) {
    return {
      text: raw.slice(MARK_INDENT.length),
      style: { center: false, bold: false, double: false, width: paperWidth },
    };
  }

  return {
    text: raw,
    style: { center: false, bold: false, double: false, width: paperWidth },
  };
}

function appendStyledLine(chunks: Buffer[], text: string, style: LineStyle): void {
  const effectiveWidth = style.width;
  const lines = style.center
    ? wrapLine(text, effectiveWidth).map((l) => centerLine(l, effectiveWidth))
    : wrapLine(text, effectiveWidth);

  for (const line of lines) {
    if (style.center) chunks.push(CMD_ALIGN_CENTER);
    else chunks.push(CMD_ALIGN_LEFT);

    if (style.bold) chunks.push(CMD_BOLD_ON);
    if (style.double) chunks.push(CMD_DOUBLE_ON);

    chunks.push(encodeToCp858(line));
    chunks.push(CMD_LF);

    if (style.double) chunks.push(CMD_DOUBLE_OFF);
    if (style.bold) chunks.push(CMD_BOLD_OFF);
    chunks.push(CMD_ALIGN_LEFT);
  }
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
  for (let i = 0; i < TICKET_FINAL_FEED_LINES; i++) {
    chunks.push(CMD_LF);
  }
  chunks.push(cutPaper());
}

function hasTicketMarkers(text: string): boolean {
  return text.includes("@C@") || text.includes("@D@") || text.includes("@S@");
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
  const marked = hasTicketMarkers(ticketText);

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) {
      chunks.push(CMD_LF);
      continue;
    }

    if (marked) {
      const { text, style } = parseTicketLine(raw, width);
      if (text.trim()) {
        appendStyledLine(chunks, text, style);
      } else {
        chunks.push(CMD_LF);
      }
      continue;
    }

    const line = normalizeSeparator(raw, width);
    const output = isLegacyCenteredLine(line, i) ? centerLine(line, width) : line;
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
      } else if (buffer[i] === 0x45) {
        parts.push(` E ${buffer[i + 1] ?? "?"}`);
        i += 1;
      }
    } else if (b === 0x1d && buffer[i + 1] === 0x21) {
      if (textRun) parts.push(textRun);
      textRun = "";
      parts.push(`[GS ! ${buffer[i + 2] ?? "?"}]`);
      i += 2;
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
