#!/usr/bin/env node
/**
 * Genera schema.sql idempotente (uso interno / regeneración).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, "..", "..", "supabase", "schema.sql");
let sql = fs.readFileSync(schemaPath, "utf8");

// ct_set_updated_at vive en idempotent_helpers.sql
sql = sql.replace(
  /CREATE OR REPLACE FUNCTION ct_set_updated_at\(\)[\s\S]*?\$\$;\n\n/,
  "",
);

// ENUMs idempotentes
sql = sql.replace(
  /^CREATE TYPE (\w+) AS ENUM \(([\s\S]*?)\);$/gm,
  (_match, name, body) => `DO $$ BEGIN
  CREATE TYPE ${name} AS ENUM (${body.trim()});
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;`,
);

// Tablas e índices
sql = sql.replace(/^CREATE TABLE /gm, "CREATE TABLE IF NOT EXISTS ");
sql = sql.replace(/^CREATE INDEX /gm, "CREATE INDEX IF NOT EXISTS ");

// Triggers → helper
sql = sql.replace(
  /CREATE TRIGGER (\w+)\s+ BEFORE UPDATE ON (\w+)\s+ FOR EACH ROW EXECUTE FUNCTION ct_set_updated_at\(\);/g,
  "SELECT ct_ensure_trigger('$1', '$2'::regclass);",
);

// Políticas
sql = sql.replace(
  /^CREATE POLICY (\w+) ON (\w+)/gm,
  "DROP POLICY IF EXISTS $1 ON $2;\nCREATE POLICY $1 ON $2",
);

// Publicación realtime
sql = sql.replace(
  /^ALTER PUBLICATION supabase_realtime ADD TABLE (\w+);$/gm,
  "SELECT ct_ensure_publication_table('supabase_realtime', '$1');",
);

const header = `-- =============================================================================
-- Comandero Taberneta — Esquema inicial Supabase (idempotente)
-- Requiere supabase/idempotent_helpers.sql antes de ejecutar.
-- =============================================================================

`;

if (!sql.startsWith("-- =============================================================================")) {
  sql = header + sql;
} else {
  sql = sql.replace(
    /-- Comandero Taberneta — Esquema inicial Supabase \(Fase 0\)/,
    "-- Comandero Taberneta — Esquema inicial Supabase (idempotente)",
  );
  sql = sql.replace(
    /-- Ejecutar en SQL Editor del proyecto Supabase\.\n-- No modifica la app Next\.js; prepara backend para fases futuras\./,
    "-- Requiere supabase/idempotent_helpers.sql antes de ejecutar.",
  );
}

fs.writeFileSync(schemaPath, sql);
console.log("schema.sql actualizado (idempotente)");
