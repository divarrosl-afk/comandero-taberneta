import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOG_DIR, "tickets.log");

const PORT = Number(process.env.PORT ?? 3100);
const PRINT_MODE = process.env.PRINT_MODE === "network" ? "network" : "mock";

const PRINTER_IPS = {
  cocina: process.env.PRINTER_COCINA_IP?.trim() || null,
  barra: process.env.PRINTER_BARRA_IP?.trim() || null,
  postres: process.env.PRINTER_POSTRES_IP?.trim() || null,
};

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function logTicket(request, result) {
  ensureLogDir();
  const entry = [
    `\n${"=".repeat(60)}`,
    `[${result.timestamp}] ${request.destino.toUpperCase()} · ${request.tipo}`,
    `Mesa: ${request.mesa ?? "—"} | Camarero: ${request.camarero ?? "—"}`,
    `Mode: ${result.mode} | OK: ${result.ok} | Simulated: ${result.simulated}`,
  ].join("\n");

  fs.appendFileSync(LOG_FILE, `${entry}\n${request.ticket}\n`, "utf8");
  console.info(entry);
  console.info(request.ticket);
}

async function printEscPosStub(request) {
  const ip = PRINTER_IPS[request.destino];
  if (!ip) {
    return {
      ok: false,
      mode: "network",
      destino: request.destino,
      tipo: request.tipo,
      message: `Sin IP configurada para impresora ${request.destino}`,
      simulated: false,
      timestamp: new Date().toISOString(),
    };
  }

  // Stub: próximo paso implementar TCP ESC/POS al puerto 9100
  return {
    ok: false,
    mode: "network",
    destino: request.destino,
    tipo: request.tipo,
    message: `ESC/POS pendiente (${ip}). Usa PRINT_MODE=mock mientras tanto.`,
    simulated: false,
    timestamp: new Date().toISOString(),
  };
}

function printMock(request) {
  const timestamp = new Date().toISOString();
  return {
    ok: true,
    mode: "mock",
    destino: request.destino,
    tipo: request.tipo,
    message: `Ticket simulado → ${request.destino}`,
    simulated: true,
    timestamp,
  };
}

async function handlePrint(request) {
  if (PRINT_MODE === "network") {
    return printEscPosStub(request);
  }
  return printMock(request);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        mode: PRINT_MODE,
        printers: PRINTER_IPS,
      }),
    );
    return;
  }

  if (req.method === "POST" && req.url === "/print") {
    try {
      const raw = await readBody(req);
      const request = JSON.parse(raw);

      if (!request.ticket || !request.destino) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, message: "Datos inválidos" }));
        return;
      }

      if (!request.tipo) request.tipo = request.destino;

      const result = await handlePrint(request);
      logTicket(request, result);

      res.writeHead(result.ok ? 200 : 502, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ok: false,
          message: "Error de impresión",
          error: error.message,
        }),
      );
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: false, message: "Not found" }));
});

server.listen(PORT, () => {
  ensureLogDir();
  console.info(`🖨️  Print server · puerto ${PORT} · modo ${PRINT_MODE}`);
  console.info(`   Health: http://localhost:${PORT}/health`);
  console.info(`   Log:    ${LOG_FILE}`);
});
