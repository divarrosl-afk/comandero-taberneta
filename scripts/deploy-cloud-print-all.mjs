#!/usr/bin/env node
/**
 * Despliegue cloud print de punta a punta:
 * 1. Migración print_jobs en Supabase (si SUPABASE_DB_URL)
 * 2. Variables Vercel + redeploy (si VERCEL_TOKEN + vars Supabase)
 * 3. Comprobación /api/print-jobs/health
 *
 * Uso local o CI:
 *   SUPABASE_DB_URL=postgresql://... \
 *   VERCEL_TOKEN=... \
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   NEXT_PUBLIC_RESTAURANTE_ID=b1c2d3e4-f5a6-4789-a012-3456789abcde \
 *   node scripts/deploy-cloud-print-all.mjs
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function runNode(script, label) {
  return new Promise((resolve, reject) => {
    console.log(`\n══ ${label} ══\n`);
    const child = spawn(process.execPath, [script], {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env,
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} falló (exit ${code})`));
    });
  });
}

async function waitForHealth(maxMs = 240_000) {
  const url = "https://comandero-taberneta.vercel.app/api/print-jobs/health";
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 10_000));
  }
  return null;
}

async function main() {
  const hasDb = Boolean(
    process.env.SUPABASE_DB_URL?.trim() || process.env.DATABASE_URL?.trim(),
  );
  const hasVercel = Boolean(process.env.VERCEL_TOKEN?.trim());

  if (!hasDb && !hasVercel) {
    console.error(
      "Define al menos SUPABASE_DB_URL (migración) o VERCEL_TOKEN (Vercel).",
    );
    process.exit(1);
  }

  if (hasDb) {
    await runNode(
      path.join(__dirname, "apply-print-jobs-migration.mjs"),
      "Paso 1 — Migración print_jobs",
    );
  } else {
    console.log("\n⏭ Paso 1 — Sin SUPABASE_DB_URL, se omite migración.\n");
  }

  if (hasVercel) {
    await runNode(
      path.join(__dirname, "setup-vercel-cloud-print.mjs"),
      "Paso 2 — Vercel env + redeploy",
    );
  } else {
    console.log("\n⏭ Paso 2 — Sin VERCEL_TOKEN, se omite Vercel.\n");
    console.log("→ Esperando /api/print-jobs/health (deploy previo)...");
    const health = await waitForHealth();
    if (!health) {
      console.warn("\n⚠ Health no responde aún:");
      console.warn("  https://comandero-taberneta.vercel.app/api/print-jobs/health");
      process.exit(1);
    }
    console.log("\n✓ Health:");
    console.log(JSON.stringify(health, null, 2));
    const ok =
      health.supabase?.serviceRoleConfigured === true &&
      health.printJobs?.tableExists === true;
    process.exit(ok ? 0 : 1);
  }
}

main().catch((err) => {
  console.error("\n✗", err.message ?? err);
  process.exit(1);
});
