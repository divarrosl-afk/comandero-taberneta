#!/usr/bin/env node
/**
 * Aplica solo la migración print_jobs y comprueba la tabla.
 *
 * Uso:
 *   SUPABASE_DB_URL="postgresql://postgres.[ref]:[PASSWORD]@..." \
 *     node scripts/apply-print-jobs-migration.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION = "20250704_print_jobs.sql";

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
  console.error("Error: npm install -D pg");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Conectado a Supabase Postgres.\n");

  const helpersPath = path.join(__dirname, "..", "supabase", "idempotent_helpers.sql");
  await client.query(fs.readFileSync(helpersPath, "utf8"));

  const sqlPath = path.join(__dirname, "..", "supabase", "migrations", MIGRATION);
  const sql = fs.readFileSync(sqlPath, "utf8");
  console.log(`→ Aplicando ${MIGRATION}...`);
  await client.query(sql);
  console.log(`  ✓ ${MIGRATION}\n`);

  const { rows } = await client.query("SELECT count(*)::int AS n FROM print_jobs");
  console.log(`SELECT count(*) FROM print_jobs → ${rows[0].n}`);
  console.log("\n✓ Migración print_jobs OK.");
} catch (e) {
  const { sanitizeLogMessage } = await import("./ci/sanitize.mjs");
  console.error("Error:", sanitizeLogMessage(e.message ?? e));
  process.exit(1);
} finally {
  await client.end();
}
