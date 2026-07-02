import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnv } from "./lib/load-env.js";
import { tcpConnectTest, printTestTicket } from "./lib/escpos.js";
import { startCloudPoller, getCloudPollerStatus } from "./lib/cloud-poller.js";
import {
  enqueueJob,
  getJob,
  jobToPrintResult,
  listJobs,
  loadQueue,
  processQueue,
} from "./lib/queue.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadLocalEnv(path.join(__dirname, ".env"));
const LOG_DIR = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOG_DIR, "tickets.log");

const PORT = Number(process.env.PORT ?? 3100);
const HOST = process.env.PRINT_SERVER_HOST ?? "0.0.0.0";
const API_KEY = process.env.PRINT_API_KEY?.trim() || "";
const CORS_ORIGINS = (process.env.PRINT_CORS_ORIGINS ?? "*")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function setCors(req, res) {
  const origin = req.headers.origin;
  if (CORS_ORIGINS.includes("*")) {
    res.setHeader("Access-Control-Allow-Origin", origin ?? "*");
  } else if (origin && CORS_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (CORS_ORIGINS[0]) {
    res.setHeader("Access-Control-Allow-Origin", CORS_ORIGINS[0]);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Print-Key, Authorization",
  );
  res.setHeader("Vary", "Origin");
}

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
    `Job: ${result.jobId ?? "—"} · Estado: ${result.status ?? "—"}`,
    `Destino: ${request.destino} · Tipo: ${request.tipo}`,
    `IP: ${imp.ip || "—"}:${imp.puerto ?? 9100} · OK: ${result.ok}`,
  ].join("\n");

  fs.appendFileSync(LOG_FILE, `${entry}\n${request.ticket}\n`, "utf8");
  console.info(entry);
}

function checkAuth(req, res) {
  if (!API_KEY) return true;
  const key = req.headers["x-print-key"];
  if (key === API_KEY) return true;
  res.writeHead(401, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: false, message: "No autorizado" }));
  return false;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/health") {
    const pending = listJobs(200).filter(
      (j) => j.status === "queued" || j.status === "error" || j.status === "printing",
    );
    const cloud = getCloudPollerStatus();
    json(res, 200, {
      ok: true,
      service: "comandero-print-server",
      version: 2,
      impresora: "principal-unica",
      queuePending: pending.length,
      authRequired: Boolean(API_KEY),
      cloudPolling: cloud.cloudPolling,
      cloudPollMs: cloud.cloudPollMs,
      supabaseConfigured: cloud.supabaseConfigured,
      missingCloudEnv: cloud.missingCloudEnv,
      cloud: {
        pollIntervalMs: cloud.pollIntervalMs,
        restauranteIdConfigured: cloud.restauranteIdConfigured,
        supabaseUrlConfigured: cloud.supabaseUrlConfigured,
        serviceRoleConfigured: cloud.serviceRoleConfigured,
        missingEnv: cloud.missingEnv,
        stats: cloud.stats,
      },
    });
    return;
  }

  if (!checkAuth(req, res)) return;

  if (req.method === "GET" && url.pathname === "/jobs") {
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const items = listJobs(limit).map(jobToPrintResult);
    json(res, 200, { ok: true, jobs: items });
    return;
  }

  const jobMatch = url.pathname.match(/^\/jobs\/([^/]+)$/);
  if (req.method === "GET" && jobMatch) {
    const job = getJob(jobMatch[1]);
    if (!job) {
      json(res, 404, { ok: false, message: "Trabajo no encontrado" });
      return;
    }
    json(res, 200, { ok: true, job: jobToPrintResult(job) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/test-connection") {
    try {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const imp = body.impresora ?? {};
      const host = imp.ip?.trim() || process.env.PRINTER_IP?.trim();
      const port = Number(imp.puerto ?? process.env.PRINTER_PORT ?? 9100);

      if (!host) {
        json(res, 400, { ok: false, message: "IP de impresora requerida" });
        return;
      }

      const test = await tcpConnectTest(host, port);
      json(res, test.ok ? 200 : 502, {
        ...test,
        host,
        port,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      json(res, 500, {
        ok: false,
        message: error instanceof Error ? error.message : "Error",
      });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/test-print") {
    try {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const imp = body.impresora ?? {};
      const advanced = url.searchParams.get("advanced") === "1";
      const result = await printTestTicket(imp, advanced);
      json(res, result.ok ? 200 : 502, {
        ...result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      json(res, 500, {
        ok: false,
        message: error instanceof Error ? error.message : "Error",
      });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/print") {
    try {
      const raw = await readBody(req);
      const request = JSON.parse(raw);

      if (!request.ticket || !request.destino) {
        json(res, 400, { ok: false, message: "Datos inválidos" });
        return;
      }

      if (!request.tipo) request.tipo = request.destino;

      const job = enqueueJob(request);
      const result = jobToPrintResult(job);
      logTicket(request, result);

      const waitSync = url.searchParams.get("sync") === "1";
      if (waitSync) {
        const deadline = Date.now() + 90_000;
        while (Date.now() < deadline) {
          const current = getJob(job.id);
          if (!current || current.status === "printed") {
            const finalJob = current ?? job;
            const finalResult = jobToPrintResult({
              ...finalJob,
              status: "printed",
            });
            json(res, finalResult.ok ? 200 : 502, finalResult);
            return;
          }
          if (current.status === "error" && current.attempts >= current.maxAttempts) {
            json(res, 502, jobToPrintResult(current));
            return;
          }
          await new Promise((r) => setTimeout(r, 400));
          await processQueue();
        }
        json(res, 504, {
          ok: false,
          jobId: job.id,
          status: "error",
          message: "Timeout esperando impresión",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      json(res, 202, result);
    } catch (error) {
      json(res, 500, {
        ok: false,
        message: "Error de impresión",
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  json(res, 404, { ok: false, message: "Not found" });
});

loadQueue();
void processQueue();

try {
  startCloudPoller();
} catch (err) {
  console.error(
    "[cloud-poller] No se pudo iniciar (el servidor local sigue activo):",
    err instanceof Error ? err.message : err,
  );
}

setInterval(() => {
  void processQueue();
}, 5000);

server.on("error", (err) => {
  if (err && "code" in err && err.code === "EADDRINUSE") {
    console.error(
      `\n✗ Puerto ${PORT} ya en uso. En Windows ejecuta: print-server\\windows\\stop-print-server.bat`,
    );
    console.error("  Luego vuelve a arrancar: npm run print-server\n");
    process.exit(1);
  }
  console.error("✗ Error del servidor HTTP:", err);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  ensureLogDir();
  console.info(`🖨️  Comandero print-server v2 · ${HOST}:${PORT}`);
  console.info(`   Health:  http://localhost:${PORT}/health`);
  console.info(`   Print:   POST http://localhost:${PORT}/print`);
  console.info(`   Test:    POST http://localhost:${PORT}/test-connection`);
  console.info(`   TestPrint POST http://localhost:${PORT}/test-print?advanced=1`);
  console.info(`   Log:     ${LOG_FILE}`);
  if (process.env.PRINT_DEBUG === "1") {
    console.info(`   Debug:   ${path.join(LOG_DIR, "last-ticket.bin")}`);
  }
  if (API_KEY) console.info("   Auth:    X-Print-Key requerido");
  const cloud = getCloudPollerStatus();
  if (cloud.cloudPolling) {
    console.info(`   Cloud:   ACTIVO · poll ${cloud.cloudPollMs}ms`);
  } else if (cloud.missingCloudEnv.length > 0) {
    console.info(
      `   Cloud:   INACTIVO · faltan ${cloud.missingCloudEnv.join(", ")}`,
    );
  }
});
