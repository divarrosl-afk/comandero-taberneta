#!/usr/bin/env node
/**
 * Bootstrap completo de la base de datos Supabase:
 * 1. schema.sql (tablas base + restaurante seed)
 * 2. Todas las migraciones en orden cronológico
 *
 * Uso:
 *   SUPABASE_DB_URL="postgresql://postgres.[ref]:[PASSWORD]@..." \
 *     npm run db:bootstrap
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const FILES = [
  "supabase/schema.sql",
  "supabase/migrations/20250630_config_impresora.sql",
  "supabase/migrations/20250630_touch_ultimo_acceso.sql",
  "supabase/migrations/20250701_realtime_comandas.sql",
  "supabase/migrations/20250702_rls_hardening.sql",
  "supabase/migrations/20250703_drop_ct_is_camarero.sql",
  "supabase/migrations/20250704_print_jobs.sql",
];

const dbUrl =
  process.env.SUPABASE_DB_URL?.trim() ||
  process.env.DATABASE_URL?.trim() ||
  "";

if (!dbUrl) {
  console.error("Error: define SUPABASE_DB_URL (Supabase → Database → Connection string URI).");
  process.exit(1);
}

let pg;
try {
  pg = await import("pg");
} catch {
  console.error("Error: npm install pg");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Conectado a Supabase Postgres.\n");

  for (const rel of FILES) {
    const sqlPath = path.join(ROOT, rel);
    const sql = fs.readFileSync(sqlPath, "utf8");
    console.log(`→ Aplicando ${rel}...`);
    await client.query(sql);
    console.log(`  ✓ ${rel}\n`);
  }

  const checks = [
    ["restaurantes", "SELECT count(*)::int AS n FROM restaurantes"],
    ["print_jobs", "SELECT count(*)::int AS n FROM print_jobs"],
  ];

  for (const [name, query] of checks) {
    const { rows } = await client.query(query);
    console.log(`${name}: ${rows[0].n} fila(s)`);
  }

  console.log("\n✓ Bootstrap Supabase OK.");
  console.log("Siguiente: npm run seed:supabase (usuarios) y variables en Vercel.");
} catch (e) {
  const { sanitizeLogMessage } = await import("./ci/sanitize.mjs");
  console.error("Error:", sanitizeLogMessage(e.message ?? e));
  process.exit(1);
} finally {
  await client.end();
}
