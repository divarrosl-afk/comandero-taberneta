import type { AnchoPapel } from "@/types/impresora";
import {
  CMD_ALIGN_CENTER,
  CMD_ALIGN_LEFT,
  CMD_CUT,
  CMD_INIT,
  CMD_LF,
  cutPaper,
} from "@/lib/impresion/escpos-commands";

export function charsPerLine(anchoPapel: AnchoPapel = "80mm"): number {
  return anchoPapel === "58mm" ? 32 : 48;
}

function wrapLine(line: string, width: number): string[] {
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

function appendText(chunks: Buffer[], text: string): void {
  for (const rawLine of text.split(/\r?\n/)) {
    for (const line of wrapLine(rawLine, 48)) {
      chunks.push(Buffer.from(line, "latin1"));
      chunks.push(CMD_LF);
    }
  }
}

/** Texto plano → buffer ESC/POS con corte. */
export function encodePlainTicket(
  text: string,
  anchoPapel: AnchoPapel = "80mm",
): Buffer {
  const width = charsPerLine(anchoPapel);
  const chunks: Buffer[] = [CMD_INIT];

  for (const rawLine of text.split(/\r?\n/)) {
    for (const line of wrapLine(rawLine, width)) {
      chunks.push(Buffer.from(line, "latin1"));
      chunks.push(CMD_LF);
    }
  }

  chunks.push(CMD_LF, CMD_LF, CMD_LF, CMD_CUT);
  return Buffer.concat(chunks);
}

/** Ticket de prueba (centrado + corte). */
export function buildTestTicketBuffer(): Buffer {
  const chunks: Buffer[] = [CMD_INIT, CMD_ALIGN_CENTER];
  appendText(chunks, "TEST IMPRESORA\n\nLA TABERNETA\n\nOK\n");
  chunks.push(CMD_ALIGN_LEFT, CMD_LF, CMD_LF, CMD_CUT);
  return Buffer.concat(chunks);
}

/** Formatea ticket operativo (cabecera centrada + cuerpo). */
export function buildTicketBuffer(
  ticketText: string,
  anchoPapel: AnchoPapel = "80mm",
): Buffer {
  const width = charsPerLine(anchoPapel);
  const lines = ticketText.split(/\r?\n/);
  const chunks: Buffer[] = [CMD_INIT];

  const separator = "=".repeat(Math.min(width, 32));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isHeader =
      i === 0 ||
      line.startsWith("MESA") ||
      line.startsWith("Mesa") ||
      line.includes("TABERNETA");

    if (isHeader && line.trim()) {
      chunks.push(CMD_ALIGN_CENTER);
      for (const wrapped of wrapLine(line, width)) {
        chunks.push(Buffer.from(wrapped, "latin1"));
        chunks.push(CMD_LF);
      }
      chunks.push(CMD_ALIGN_LEFT);
      continue;
    }

    if (line.trim() === separator || line.trim().match(/^[-=]+$/)) {
      chunks.push(Buffer.from(separator, "latin1"));
      chunks.push(CMD_LF);
      continue;
    }

    for (const wrapped of wrapLine(line, width)) {
      chunks.push(Buffer.from(wrapped, "latin1"));
      chunks.push(CMD_LF);
    }
  }

  chunks.push(CMD_LF, CMD_LF, cutPaper());
  return Buffer.concat(chunks);
}
