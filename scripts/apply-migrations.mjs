#!/usr/bin/env node
/**
 * Aplica migraciones SQL pendientes vía conexión Postgres directa.
 *
 * Uso (desde Supabase → Settings → Database → Connection string URI):
 *   SUPABASE_DB_URL="postgresql://postgres.[ref]:[PASSWORD]@..." \
 *     node scripts/apply-migrations.mjs
 *
 * Migraciones aplicadas en orden:
 *   20250702_rls_hardening.sql
 *   20250703_drop_ct_is_camarero.sql
 *   20250704_print_jobs.sql
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS = [
  "20250702_rls_hardening.sql",
  "20250703_drop_ct_is_camarero.sql",
  "20250704_print_jobs.sql",
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

  for (const file of MIGRATIONS) {
    const sqlPath = path.join(__dirname, "..", "supabase", "migrations", file);
    const sql = fs.readFileSync(sqlPath, "utf8");
    console.log(`→ Aplicando ${file}...`);
    await client.query(sql);
    console.log(`  ✓ ${file}\n`);
  }

  console.log("Migraciones aplicadas correctamente.");
} catch (e) {
  console.error("Error al aplicar migraciones:", e.message ?? e);
  process.exit(1);
} finally {
  await client.end();
}
