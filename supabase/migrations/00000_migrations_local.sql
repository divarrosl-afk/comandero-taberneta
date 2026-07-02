-- Tabla de control de migraciones locales (bootstrap / CI)
CREATE TABLE IF NOT EXISTS supabase_migrations_local (
  filename     TEXT PRIMARY KEY,
  checksum     TEXT NOT NULL,
  executed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
