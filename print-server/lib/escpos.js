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
const TICKET_FINAL_FEED_LINES = 5;
const PRINTER_FLUSH_MS = 250;

const CMD_INIT = Buffer.from([ESC, 0x40]);
const CMD_CP858 = Buffer.from([ESC, 0x74, 19]);
const CMD_ALIGN_LEFT = Buffer.from([ESC, 0x61, 0x00]);
const CMD_ALIGN_CENTER = Buffer.from([ESC, 0x61, 0x01]);
const CMD_ALIGN_RIGHT = Buffer.from([ESC, 0x61, 0x02]);
const CMD_BOLD_ON = Buffer.from([ESC, 0x45, 0x01]);
const CMD_BOLD_OFF = Buffer.from([ESC, 0x45, 0x00]);
const CMD_DOUBLE_ON = Buffer.from([GS, 0x21, 0x11]);
const CMD_DOUBLE_HEIGHT_ON = Buffer.from([GS, 0x21, 0x01]);
const CMD_DOUBLE_OFF = Buffer.from([GS, 0x21, 0x00]);
const CMD_LF = Buffer.from([0x0a]);

const MARK_MESA = "@H@";
const MARK_CENTER = "@C@";
const MARK_SEP = "@S@";
const MARK_SECTION = "@T@";
const MARK_URGENT = "@U@";
const MARK_DISH = "@D@";
const MARK_DETAIL = "@M@";
const MARK_INDENT = "@I@";

const UNICODE_TO_CP858 = {
  0x20ac: 0xd5,
  0x00c7: 0x80, 0x00fc: 0x81, 0x00e9: 0x82, 0x00e2: 0x83, 0x00e4: 0x84,
  0x00e0: 0x85, 0x00e5: 0x86, 0x00e7: 0x87, 0x00ea: 0x88, 0x00eb: 0x89,
  0x00e8: 0x8a, 0x00ef: 0x8b, 0x00ee: 0x8c, 0x00ec: 0x8d, 0x00c4: 0x8e,
  0x00c5: 0x8f, 0x00c9: 0x90, 0x00e6: 0x91, 0x00c6: 0x92, 0x00f4: 0x93,
  0x00f6: 0x94, 0x00f2: 0x95, 0x00fb: 0x96, 0x00f9: 0x97, 0x00ff: 0x98,
  0x00d6: 0x99, 0x00dc: 0x9a, 0x00f8: 0x9b, 0x00a3: 0x9c, 0x00d8: 0x9d,
  0x00d7: 0x9e, 0x00e1: 0xa0, 0x00ed: 0xa1, 0x00f3: 0xa2, 0x00fa: 0xa3,
  0x00f1: 0xa4, 0x00d1: 0xa5, 0x00aa: 0xa6, 0x00ba: 0xa7, 0x00bf: 0xa8,
  0x00ae: 0xa9, 0x00ac: 0xac, 0x00a1: 0xad, 0x00ab: 0xae, 0x00bb: 0xaf,
  0x00c1: 0xb5, 0x00cd: 0xd6, 0x00d3: 0xe0, 0x00da: 0xe9,
};

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
  return text.includes("@H@") || text.includes("@C@") || text.includes("@D@") || text.includes("@M@") || text.includes("@S@");
}

function parseTicketLine(raw, paperWidth) {
  const normal = { align: "left", bold: false, double: false, doubleHeight: false, width: paperWidth };
  if (raw === MARK_SEP) {
    return { text: "=".repeat(paperWidth), style: { ...normal } };
  }
  if (raw.startsWith(MARK_MESA)) {
    return {
      text: raw.slice(MARK_MESA.length),
      style: { align: "right", bold: true, double: true, doubleHeight: false, width: Math.floor(paperWidth / 2) },
    };
  }
  if (raw.startsWith(MARK_CENTER)) {
    return {
      text: raw.slice(MARK_CENTER.length),
      style: { align: "center", bold: true, double: false, doubleHeight: false, width: paperWidth },
    };
  }
  if (raw.startsWith(MARK_SECTION)) {
    return {
      text: raw.slice(MARK_SECTION.length),
      style: { align: "center", bold: true, double: false, doubleHeight: false, width: paperWidth },
    };
  }
  if (raw.startsWith(MARK_URGENT)) {
    const text = raw.slice(MARK_URGENT.length) || ">>> URGENTE <<<";
    return {
      text,
      style: { align: "center", bold: true, double: true, doubleHeight: false, width: Math.floor(paperWidth / 2) },
    };
  }
  if (raw.startsWith(MARK_DISH)) {
    return {
      text: raw.slice(MARK_DISH.length),
      style: { align: "left", bold: true, double: true, doubleHeight: false, width: Math.floor(paperWidth / 2) },
    };
  }
  if (raw.startsWith(MARK_DETAIL)) {
    return {
      text: raw.slice(MARK_DETAIL.length),
      style: { align: "left", bold: true, double: false, doubleHeight: true, width: paperWidth },
    };
  }
  if (raw.startsWith(MARK_INDENT)) {
    return { text: raw.slice(MARK_INDENT.length), style: { ...normal } };
  }
  return { text: raw, style: { ...normal } };
}

function alignCommand(align) {
  if (align === "center") return CMD_ALIGN_CENTER;
  if (align === "right") return CMD_ALIGN_RIGHT;
  return CMD_ALIGN_LEFT;
}

function appendStyledLine(chunks, text, style) {
  const effectiveWidth = style.width;
  const lines = wrapLine(text, effectiveWidth);

  for (const line of lines) {
    chunks.push(alignCommand(style.align));
    if (style.bold) chunks.push(CMD_BOLD_ON);
    if (style.double) chunks.push(CMD_DOUBLE_ON);
    else if (style.doubleHeight) chunks.push(CMD_DOUBLE_HEIGHT_ON);
    chunks.push(encodeToCp858(line));
    chunks.push(CMD_LF);
    if (style.double || style.doubleHeight) chunks.push(CMD_DOUBLE_OFF);
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

function feedAndCutPartial(feedLines = TICKET_FINAL_FEED_LINES) {
  return Buffer.from([GS, 0x56, 0x42, Math.min(255, Math.max(0, feedLines))]);
}

function ticketEpilogue(chunks) {
  for (let i = 0; i < TICKET_FINAL_FEED_LINES; i++) {
    chunks.push(CMD_LF);
  }
  chunks.push(feedAndCutPartial(TICKET_FINAL_FEED_LINES));
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
        await new Promise((r) => setTimeout(r, PRINTER_FLUSH_MS));
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
