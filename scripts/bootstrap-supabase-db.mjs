#!/usr/bin/env node
/**
 * Bootstrap idempotente de Supabase:
 * - Helpers + tabla de control
 * - schema.sql + migraciones (re-ejecutables sin error)
 *
 * Uso:
 *   SUPABASE_DB_URL="postgresql://..." npm run db:bootstrap
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const FILES = [
  "supabase/idempotent_helpers.sql",
  "supabase/migrations/00000_migrations_local.sql",
  "supabase/schema.sql",
  "supabase/migrations/20250630_config_impresora.sql",
  "supabase/migrations/20250630_touch_ultimo_acceso.sql",
  "supabase/migrations/20250701_realtime_comandas.sql",
  "supabase/migrations/20250702_rls_hardening.sql",
  "supabase/migrations/20250703_drop_ct_is_camarero.sql",
  "supabase/migrations/20250704_print_jobs.sql",
  "supabase/migrations/20250705_estado_panel_enum_add.sql",
  "supabase/migrations/20250705_estado_panel_enum_data.sql",
  "supabase/migrations/20250706_postres_cafes_seccion.sql",
  "supabase/migrations/20250707_menu_importados.sql",
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

function checksum(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function recordMigration(client, filename, sum) {
  await client.query(
    `INSERT INTO supabase_migrations_local (filename, checksum, executed_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (filename) DO UPDATE
       SET checksum = EXCLUDED.checksum,
           executed_at = EXCLUDED.executed_at`,
    [filename, sum],
  );
}

async function applyFile(client, rel, { force = false } = {}) {
  const sqlPath = path.join(ROOT, rel);
  const sql = fs.readFileSync(sqlPath, "utf8");
  const sum = checksum(sql);

  const hasTable = await client.query(`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'supabase_migrations_local'
  `);

  if (hasTable.rowCount > 0 && !force) {
    const { rows } = await client.query(
      "SELECT checksum FROM supabase_migrations_local WHERE filename = $1",
      [rel],
    );
    if (rows[0]?.checksum === sum) {
      console.log(`  ⏭ ${rel} (sin cambios)`);
      return;
    }
  }

  console.log(`→ Aplicando ${rel}...`);
  await client.query(sql);

  if (rel !== "supabase/migrations/00000_migrations_local.sql") {
    const tracked = await client.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'supabase_migrations_local'
    `);
    if (tracked.rowCount > 0) {
      await recordMigration(client, rel, sum);
    }
  }

  console.log(`  ✓ ${rel}\n`);
}

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Conectado a Supabase Postgres.\n");

  for (const rel of FILES) {
    await applyFile(client, rel);
  }

  const checks = [
    ["restaurantes", "SELECT count(*)::int AS n FROM restaurantes"],
    ["print_jobs", "SELECT count(*)::int AS n FROM print_jobs"],
  ];

  for (const [name, query] of checks) {
    const { rows } = await client.query(query);
    console.log(`${name}: ${rows[0].n} fila(s)`);
  }

  console.log("\n✓ Bootstrap Supabase OK (idempotente).");
} catch (e) {
  const { sanitizeLogMessage } = await import("./ci/sanitize.mjs");
  console.error("Error:", sanitizeLogMessage(e.message ?? e));
  process.exit(1);
} finally {
  await client.end();
}
