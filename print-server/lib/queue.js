import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { printEscPosTicket } from "./escpos.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const QUEUE_FILE = path.join(DATA_DIR, "queue.json");

const MAX_ATTEMPTS = 8;
const BASE_RETRY_MS = 3000;
const MAX_RETRY_MS = 60_000;

let jobs = [];
let processing = false;
let persistTimer = null;
let onJobUpdate = null;
/** Trabajos impresos recientes (para polling del cliente). */
const completedJobs = new Map();
const COMPLETED_TTL_MS = 15 * 60 * 1000;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function schedulePersist() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    persistQueue();
  }, 100);
}

function persistQueue() {
  ensureDataDir();
  const active = jobs.filter(
    (j) => j.status === "queued" || j.status === "printing" || j.status === "error",
  );
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(active, null, 2), "utf8");
}

export function loadQueue() {
  ensureDataDir();
  if (!fs.existsSync(QUEUE_FILE)) {
    jobs = [];
    return;
  }
  try {
    const raw = fs.readFileSync(QUEUE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    jobs = Array.isArray(parsed) ? parsed : [];
    for (const job of jobs) {
      if (job.status === "printing") {
        job.status = "queued";
      }
    }
  } catch {
    jobs = [];
  }
}

export function setJobUpdateListener(fn) {
  onJobUpdate = fn;
}

function notify(job) {
  if (onJobUpdate) onJobUpdate(job);
}

function pruneCompleted() {
  const now = Date.now();
  for (const [id, entry] of completedJobs) {
    if (entry.expiresAt <= now) completedJobs.delete(id);
  }
}

function rememberCompleted(job) {
  completedJobs.set(job.id, {
    job: { ...job },
    expiresAt: Date.now() + COMPLETED_TTL_MS,
  });
}

function backoffMs(attempts) {
  return Math.min(BASE_RETRY_MS * 2 ** Math.max(0, attempts - 1), MAX_RETRY_MS);
}

export function enqueueJob(request) {
  const now = new Date().toISOString();
  const job = {
    id: crypto.randomUUID(),
    status: "queued",
    request,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    nextRetryAt: null,
    createdAt: now,
    updatedAt: now,
    error: null,
    message: null,
  };
  jobs.push(job);
  schedulePersist();
  notify(job);
  void processQueue();
  return job;
}

export function getJob(id) {
  pruneCompleted();
  const active = jobs.find((j) => j.id === id);
  if (active) return active;
  return completedJobs.get(id)?.job ?? null;
}

export function listJobs(limit = 50) {
  return [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

function setJobStatus(job, status, extra = {}) {
  job.status = status;
  job.updatedAt = new Date().toISOString();
  Object.assign(job, extra);
  schedulePersist();
  notify(job);
}

async function executeJob(job) {
  const imp = job.request.impresora ?? {};
  const modo = imp.modo === "network" ? "network" : "mock";

  if (!imp.activa) {
    return {
      ok: true,
      mode: "mock",
      simulated: true,
      message: "Impresora inactiva — ticket no enviado",
    };
  }

  if (modo === "mock") {
    return {
      ok: true,
      mode: "mock",
      simulated: true,
      message: `Ticket simulado → ${imp.nombre ?? "Impresora principal"}`,
    };
  }

  const result = await printEscPosTicket(imp, job.request.ticket);
  return {
    ok: result.ok,
    mode: "network",
    simulated: false,
    message: result.message,
  };
}

export async function processQueue() {
  if (processing) return;
  processing = true;

  try {
    while (true) {
      const now = Date.now();
      const job = jobs.find((j) => {
        if (j.attempts >= j.maxAttempts) return false;
        if (j.status === "printing") return false;
        if (j.status === "queued") return true;
        if (j.status === "error") {
          if (!j.nextRetryAt) return true;
          return new Date(j.nextRetryAt).getTime() <= now;
        }
        return false;
      });

      if (!job) break;

      if (job.status === "error") {
        setJobStatus(job, "queued", { nextRetryAt: null, error: null });
      }

      setJobStatus(job, "printing", { error: null });
      job.attempts += 1;

      try {
        const result = await executeJob(job);
        if (result.ok) {
          setJobStatus(job, "printed", {
            message: result.message,
            error: null,
            result,
          });
          rememberCompleted(job);
          jobs = jobs.filter((j) => j.id !== job.id);
          schedulePersist();
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error de impresión";
        if (job.attempts >= job.maxAttempts) {
          setJobStatus(job, "error", { error: msg, message: msg });
        } else {
          const wait = backoffMs(job.attempts);
          setJobStatus(job, "error", {
            error: msg,
            message: `${msg} — reintento en ${Math.round(wait / 1000)}s`,
            nextRetryAt: new Date(Date.now() + wait).toISOString(),
          });
          break;
        }
      }
    }
  } finally {
    processing = false;
  }
}

export function jobToPrintResult(job) {
  const imp = job.request.impresora ?? {};
  const modo = imp.modo === "network" ? "network" : "mock";
  const ok = job.status === "printed";

  return {
    ok,
    jobId: job.id,
    status: job.status,
    mode: modo,
    destino: job.request.destino,
    tipo: job.request.tipo,
    message:
      job.message ??
      job.error ??
      (ok ? "Impreso" : "En cola de impresión"),
    simulated: modo === "mock" && ok,
    timestamp: job.updatedAt,
    attempts: job.attempts,
  };
}
