#!/usr/bin/env node
/**
 * Configuración completa Comandero Taberneta (un solo comando).
 *
 * Requiere en el entorno:
 *   SUPABASE_DB_URL          — Connection string Postgres (Supabase → Database)
 *   SUPABASE_SERVICE_ROLE_KEY
 *   VERCEL_TOKEN
 *
 * Opcionales (tienen default del proyecto vhlzbfrzmqljngwegbde):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *   NEXT_PUBLIC_RESTAURANTE_ID
 *   SEED_ADMIN_PASSWORD / SEED_CAMARERO_PASSWORD — si quieres crear usuarios
 *
 * Uso:
 *   npm run setup:all
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const DEFAULTS = {
  NEXT_PUBLIC_SUPABASE_URL: "https://vhlzbfrzmqljngwegbde.supabase.co",
  NEXT_PUBLIC_RESTAURANTE_ID: "b1c2d3e4-f5a6-4789-a012-3456789abcde",
  NEXT_PUBLIC_DATA_BACKEND: "supabase",
};

for (const [key, value] of Object.entries(DEFAULTS)) {
  if (!process.env[key]?.trim()) process.env[key] = value;
}

const REQUIRED = [
  ["SUPABASE_DB_URL", "Supabase → Database → Connection string URI"],
  ["SUPABASE_SERVICE_ROLE_KEY", "Supabase → Settings → API → service_role"],
  ["VERCEL_TOKEN", "https://vercel.com/account/tokens"],
];

const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
if (!anon) {
  console.error(
    "Falta NEXT_PUBLIC_SUPABASE_ANON_KEY o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anon;
}

for (const [key, hint] of REQUIRED) {
  if (!process.env[key]?.trim()) {
    console.error(`\n✗ Falta ${key}`);
    console.error(`  → ${hint}`);
    process.exit(1);
  }
}

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

function writePrintServerEnv() {
  const lines = [
    "PORT=3100",
    "PRINTER_IP=192.168.4.100",
    "PRINTER_PORT=9100",
    "PRINT_MODE=network",
    "PRINT_SERVER_HOST=0.0.0.0",
    "",
    `NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
    `SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    `SUPABASE_RESTAURANTE_ID=${process.env.NEXT_PUBLIC_RESTAURANTE_ID}`,
    "CLOUD_POLL_MS=3000",
    "",
  ];
  const target = path.join(ROOT, "print-server", ".env");
  const existing = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
  const merged = `${existing.trim()}\n\n# --- cloud print (setup-all) ---\n${lines.join("\n")}\n`;
  fs.writeFileSync(target, merged);
  console.log("\n✓ print-server/.env actualizado (revisa PRINTER_IP en el Lenovo)");
}

async function waitForHealth(maxMs = 300_000) {
  const url = "https://comandero-taberneta.vercel.app/api/print-jobs/health";
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const ok =
          data.supabase?.serviceRoleConfigured === true &&
          data.printJobs?.tableExists === true &&
          data.supabase?.restauranteId;
        if (ok) return data;
      }
    } catch {
      /* retry */
    }
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 12_000));
  }
  return null;
}

async function main() {
  console.log("Comandero Taberneta — setup completo");
  console.log(`Supabase: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

  await runNode(
    path.join(__dirname, "bootstrap-supabase-db.mjs"),
    "1/4 — Bootstrap Supabase (schema + migraciones)",
  );

  if (
    process.env.SEED_ADMIN_PASSWORD?.trim() &&
    process.env.SEED_CAMARERO_PASSWORD?.trim()
  ) {
    await runNode(
      path.join(__dirname, "seed-supabase.mjs"),
      "2/4 — Seed usuarios",
    );
  } else {
    console.log("\n⏭ 2/4 — Seed omitido (define SEED_ADMIN_PASSWORD y SEED_CAMARERO_PASSWORD)\n");
  }

  await runNode(
    path.join(__dirname, "setup-vercel-cloud-print.mjs"),
    "3/4 — Vercel variables + redeploy",
  );

  writePrintServerEnv();

  console.log("\n══ 4/4 — Verificando health ══\n");
  const health = await waitForHealth();
  if (!health) {
    console.error("\n✗ Health no OK tras 5 min:");
    console.error("  https://comandero-taberneta.vercel.app/api/print-jobs/health");
    process.exit(1);
  }

  console.log("\n✓ Setup completo:\n");
  console.log(JSON.stringify(health, null, 2));
  console.log("\nEn el Lenovo: npm run print-server → [cloud-poller] ACTIVO");
}

main().catch((err) => {
  console.error("\n✗", err.message ?? err);
  process.exit(1);
});
