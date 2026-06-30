import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOG_DIR, "tickets.log");

const PORT = Number(process.env.PORT ?? 3100);

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function logTicket(request, result) {
  ensureLogDir();
  const imp = request.impresora ?? {};
  const entry = [
    `\n${"=".repeat(60)}`,
    `[${result.timestamp}] ${imp.nombre ?? "Impresora principal"}`,
    `Destino lógico: ${request.destino} · Tipo: ${request.tipo}`,
    `IP: ${imp.ip || "—"}:${imp.puerto ?? 9100} · Papel: ${imp.anchoPapel ?? "80mm"}`,
    `Mesa: ${request.mesa ?? "—"} | Mode: ${result.mode} | OK: ${result.ok}`,
  ].join("\n");

  fs.appendFileSync(LOG_FILE, `${entry}\n${request.ticket}\n`, "utf8");
  console.info(entry);
  console.info(request.ticket);
}

async function printEscPosStub(request) {
  const imp = request.impresora ?? {};
  if (!imp.ip) {
    return {
      ok: false,
      mode: "network",
      destino: request.destino,
      tipo: request.tipo,
      message: "Configure la IP de la impresora principal",
      simulated: false,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    ok: false,
    mode: "network",
    destino: request.destino,
    tipo: request.tipo,
    message: `ESC/POS pendiente (${imp.nombre} @ ${imp.ip}:${imp.puerto ?? 9100})`,
    simulated: false,
    timestamp: new Date().toISOString(),
  };
}

function printMock(request) {
  const timestamp = new Date().toISOString();
  const imp = request.impresora ?? {};
  return {
    ok: true,
    mode: "mock",
    destino: request.destino,
    tipo: request.tipo,
    message: `Ticket simulado → ${imp.nombre ?? "Impresora principal"}`,
    simulated: true,
    timestamp,
  };
}

async function handlePrint(request) {
  const imp = request.impresora ?? {};
  const modo = imp.modo === "network" ? "network" : "mock";

  if (!imp.activa) {
    return {
      ok: true,
      mode: "mock",
      destino: request.destino,
      tipo: request.tipo,
      message: "Impresora inactiva — ticket no enviado",
      simulated: true,
      timestamp: new Date().toISOString(),
    };
  }

  if (modo === "network") {
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
    res.end(JSON.stringify({ ok: true, impresora: "principal-unica" }));
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
  console.info(`🖨️  Print server · puerto ${PORT} · impresora principal única`);
  console.info(`   Health: http://localhost:${PORT}/health`);
  console.info(`   Log:    ${LOG_FILE}`);
});
