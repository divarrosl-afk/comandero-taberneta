#!/usr/bin/env node
/**
 * Aplica migraciones SQL pendientes vía conexión Postgres directa.
 *
 * Uso (desde Supabase → Settings → Database → Connection string URI):
 *   SUPABASE_DB_URL="postgresql://postgres.[ref]:[PASSWORD]@..." \
 *     node scripts/apply-migrations.mjs
 *
 * Migraciones aplicadas en orden (idempotentes; requiere helpers):
 *   idempotent_helpers + 20250702 … 20250704
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const MIGRATIONS = [
  "supabase/idempotent_helpers.sql",
  "supabase/migrations/20250702_rls_hardening.sql",
  "supabase/migrations/20250703_drop_ct_is_camarero.sql",
  "supabase/migrations/20250704_print_jobs.sql",
];

const dbUrl =
  process.env.SUPABASE_DB_URL?.trim() ||
  process.env.DATABASE_URL?.trim() ||
  "";

if (!dbUrl) {
  console.error(
    "Error: define SUPABASE_DB_URL o DATABASE_URL (connection string Postgres de Supabase).",
  );
  console.error(
    "Dashboard → Project Settings → Database → Connection string → URI",
  );
  process.exit(1);
}

let pg;
try {
  pg = await import("pg");
} catch {
  console.error(
    "Error: instala pg para ejecutar migraciones: npm install -D pg",
  );
  process.exit(1);
}

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log("Conectado a Supabase Postgres.\n");

  for (const rel of MIGRATIONS) {
    const sqlPath = path.join(ROOT, rel);
    const sql = fs.readFileSync(sqlPath, "utf8");
    console.log(`→ Aplicando ${rel}...`);
    await client.query(sql);
    console.log(`  ✓ ${rel}\n`);
  }

  console.log("Migraciones aplicadas correctamente.");
} catch (e) {
  const { sanitizeLogMessage } = await import("./ci/sanitize.mjs");
  console.error("Error al aplicar migraciones:", sanitizeLogMessage(e.message ?? e));
  process.exit(1);
} finally {
  await client.end();
}
