import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, "..", "logs");
const DEBUG_BIN = path.join(LOG_DIR, "last-ticket.bin");
const DEBUG_TXT = path.join(LOG_DIR, "last-ticket.txt");

const ESC = 0x1b;
const GS = 0x1d;
const CHARS_PER_LINE_80MM = 48;
const TCP_CHUNK_SIZE = 1024;
const TCP_PRINT_TIMEOUT_MS = 20_000;

const CMD_INIT = Buffer.from([ESC, 0x40]);
const CMD_CP858 = Buffer.from([ESC, 0x74, 19]);
const CMD_ALIGN_LEFT = Buffer.from([ESC, 0x61, 0x00]);
const CMD_ALIGN_CENTER = Buffer.from([ESC, 0x61, 0x01]);
const CMD_BOLD_ON = Buffer.from([ESC, 0x45, 0x01]);
const CMD_BOLD_OFF = Buffer.from([ESC, 0x45, 0x00]);
const CMD_DOUBLE_ON = Buffer.from([GS, 0x21, 0x11]);
const CMD_DOUBLE_OFF = Buffer.from([GS, 0x21, 0x00]);
const CMD_LF = Buffer.from([0x0a]);

const MARK_CENTER = "@C@";
const MARK_SEP = "@S@";
const MARK_SECTION = "@T@";
const MARK_URGENT = "@U@";
const MARK_DISH = "@D@";
const MARK_INDENT = "@I@";

const UNICODE_TO_CP858 = { 0x20ac: 0xd5 };

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

export function charsPerLine(anchoPapel = "80mm") {
  return anchoPapel === "58mm" ? 32 : CHARS_PER_LINE_80MM;
}

function encodeToCp858(text) {
  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (UNICODE_TO_CP858[code] !== undefined) {
      bytes.push(UNICODE_TO_CP858[code]);
    } else if (code <= 0xff) {
      bytes.push(code);
    } else {
      bytes.push(0x3f);
    }
  }
  return Buffer.from(bytes);
}

export function wrapLine(line, width) {
  if (line.length <= width) return [line];
  const parts = [];
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

function centerLine(line, width) {
  const trimmed = line.trim();
  if (!trimmed) return "";
  if (trimmed.length >= width) return trimmed.slice(0, width);
  const pad = Math.floor((width - trimmed.length) / 2);
  return `${" ".repeat(pad)}${trimmed}`;
}

function normalizeSeparator(line, width) {
  const t = line.trim();
  if (/^[-=]+$/.test(t)) return "=".repeat(width);
  return line;
}

function isLegacyCenteredLine(line, index) {
  const t = line.trim();
  if (!t) return false;
  if (index === 0) return true;
  if (/^MESA\s/i.test(t)) return true;
  if (/TABERNETA/i.test(t)) return true;
  if (/^TEST ESC\/POS$/i.test(t)) return true;
  if (/^Gracias$/i.test(t)) return true;
  return false;
}

function hasTicketMarkers(text) {
  return text.includes("@C@") || text.includes("@D@") || text.includes("@S@");
}

function parseTicketLine(raw, paperWidth) {
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

function appendStyledLine(chunks, text, style) {
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

function appendLine(chunks, line, width) {
  for (const wrapped of wrapLine(line, width)) {
    chunks.push(encodeToCp858(wrapped));
    chunks.push(CMD_LF);
  }
}

function feedAndCutPartial(feedLines = 3) {
  return Buffer.from([GS, 0x56, 0x42, Math.min(255, Math.max(0, feedLines))]);
}

function ticketEpilogue(chunks) {
  chunks.push(CMD_LF, CMD_LF, CMD_LF, feedAndCutPartial(3));
}

function isDebugEnabled() {
  const v = process.env.PRINT_DEBUG?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function writeDebugTicket(buffer, plainText) {
  if (!isDebugEnabled()) return;
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  fs.writeFileSync(DEBUG_BIN, buffer);
  fs.writeFileSync(
    DEBUG_TXT,
    plainText?.trim() || buffer.toString("latin1"),
    "utf8",
  );
}

/** Construye buffer ESC/POS completo (misma lógica que src/lib/impresion). */
export function buildEscPosBuffer(ticketText, anchoPapel = "80mm") {
  const width = charsPerLine(anchoPapel);
  const chunks = [CMD_INIT, CMD_CP858, CMD_ALIGN_LEFT];
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

export function encodeTicket(text, anchoPapel = "80mm") {
  return buildEscPosBuffer(text, anchoPapel);
}

export function buildTestTicketBuffer() {
  return buildEscPosBuffer("TEST IMPRESORA\n\nLA TABERNETA\n\nOK\n", "80mm");
}

export function buildAdvancedTestTicketBuffer() {
  return buildEscPosBuffer(ADVANCED_TEST_TICKET_TEXT, "80mm");
}

function writeBufferToSocket(socket, buffer) {
  return new Promise((resolve, reject) => {
    socket.setNoDelay(true);
    let offset = 0;

    const writeNext = () => {
      if (offset >= buffer.length) {
        resolve();
        return;
      }
      const chunk = buffer.subarray(
        offset,
        Math.min(offset + TCP_CHUNK_SIZE, buffer.length),
      );
      offset += chunk.length;
      try {
        const canContinue = socket.write(chunk);
        if (canContinue) writeNext();
        else socket.once("drain", writeNext);
      } catch (err) {
        reject(err);
      }
    };

    writeNext();
  });
}

export function tcpConnectTest(host, port, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const probe = CMD_INIT;
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const socket = net.createConnection({ host, port }, () => {
      socket.write(probe, (writeErr) => {
        socket.destroy();
        if (writeErr) {
          finish({
            ok: false,
            message: writeErr.message || `No se pudo enviar a ${host}:${port}`,
          });
          return;
        }
        finish({
          ok: true,
          message: `Conexión OK con ${host}:${port}`,
        });
      });
    });

    socket.setTimeout(timeoutMs);
    socket.on("timeout", () => {
      socket.destroy();
      finish({
        ok: false,
        message: `Timeout al conectar con ${host}:${port}`,
      });
    });
    socket.on("error", (err) => {
      finish({
        ok: false,
        message: err.message || `No se pudo conectar con ${host}:${port}`,
      });
    });
  });
}

export function printTcp(host, port, data, plainText, timeoutMs = TCP_PRINT_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });

    socket.setTimeout(timeoutMs);

    socket.on("connect", async () => {
      try {
        writeDebugTicket(data, plainText);
        await writeBufferToSocket(socket, data);
        socket.end();
      } catch (writeErr) {
        socket.destroy();
        reject(writeErr);
      }
    });

    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error(`Timeout imprimiendo en ${host}:${port}`));
    });
    socket.on("error", (err) => {
      reject(err);
    });
    socket.on("close", () => {
      resolve();
    });
  });
}

export async function printEscPosTicket(impresora, ticket) {
  if (!impresora?.ip?.trim()) {
    return {
      ok: false,
      message: "Configure la IP de la impresora principal",
    };
  }

  const host = impresora.ip.trim();
  const port = Number(impresora.puerto) || 9100;
  const ancho = impresora.anchoPapel ?? "80mm";
  const data = buildEscPosBuffer(ticket, ancho);

  try {
    await printTcp(host, port, data, ticket);
    return {
      ok: true,
      message: `Impreso en ${impresora.nombre ?? "impresora"} (${host}:${port})`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error de impresión TCP";
    return { ok: false, message: msg };
  }
}

export async function printTestTicket(impresora, advanced = false) {
  if (!impresora?.ip?.trim()) {
    return { ok: false, message: "IP de impresora no configurada" };
  }
  const host = impresora.ip.trim();
  const port = Number(impresora.puerto) || 9100;
  const data = advanced
    ? buildAdvancedTestTicketBuffer()
    : buildTestTicketBuffer();

  try {
    await printTcp(host, port, data);
    return { ok: true, message: "Ticket de prueba impreso" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error de impresión";
    return { ok: false, message: msg };
  }
}
