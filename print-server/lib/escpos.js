import net from "node:net";

const INIT = Buffer.from([0x1b, 0x40]);
const CUT = Buffer.from([0x1d, 0x56, 0x00]);
const LF = Buffer.from([0x0a]);

/** Ancho útil en caracteres (aprox.) */
export function charsPerLine(anchoPapel) {
  return anchoPapel === "58mm" ? 32 : 48;
}

function wrapLine(line, width) {
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

/**
 * Convierte texto plano a bytes ESC/POS (latin1 + corte).
 * Compatible con impresoras térmicas red puerto 9100.
 */
export function encodeTicket(text, anchoPapel = "80mm") {
  const width = charsPerLine(anchoPapel);
  const chunks = [INIT];

  for (const rawLine of text.split(/\r?\n/)) {
    for (const line of wrapLine(rawLine, width)) {
      chunks.push(Buffer.from(line, "latin1"));
      chunks.push(LF);
    }
  }

  chunks.push(LF, LF, LF, CUT);
  return Buffer.concat(chunks);
}

export function tcpConnectTest(host, port, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port }, () => {
      socket.end();
      resolve({
        ok: true,
        message: `Conexión OK con ${host}:${port}`,
      });
    });

    socket.setTimeout(timeoutMs);
    socket.on("timeout", () => {
      socket.destroy();
      resolve({
        ok: false,
        message: `Timeout al conectar con ${host}:${port}`,
      });
    });
    socket.on("error", (err) => {
      resolve({
        ok: false,
        message: err.message || `No se pudo conectar con ${host}:${port}`,
      });
    });
  });
}

export function printTcp(host, port, data, timeoutMs = 12_000) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port }, () => {
      socket.write(data, (writeErr) => {
        if (writeErr) {
          socket.destroy();
          reject(writeErr);
          return;
        }
        socket.end();
      });
    });

    socket.setTimeout(timeoutMs);
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
  const data = encodeTicket(ticket, impresora.anchoPapel ?? "80mm");

  try {
    await printTcp(host, port, data);
    return {
      ok: true,
      message: `Impreso en ${impresora.nombre ?? "impresora"} (${host}:${port})`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error de impresión TCP";
    return { ok: false, message: msg };
  }
}
