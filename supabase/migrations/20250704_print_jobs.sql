-- Cola de impresión en nube (Vercel → print-server Lenovo)
-- Idempotente — requiere supabase/idempotent_helpers.sql

CREATE TABLE IF NOT EXISTS print_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id  UUID NOT NULL REFERENCES restaurantes (id) ON DELETE CASCADE,
  ticket          TEXT NOT NULL,
  destino         TEXT NOT NULL CHECK (destino IN ('cocina', 'barra', 'postres')),
  tipo            TEXT NOT NULL DEFAULT 'cocina',
  impresora       JSONB NOT NULL DEFAULT '{}',
  comanda_id      TEXT,
  mesa            TEXT,
  camarero        TEXT,
  status          TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'printing', 'printed', 'error')),
  error_message   TEXT,
  attempts        INTEGER NOT NULL DEFAULT 0,
  max_attempts    INTEGER NOT NULL DEFAULT 8,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  printed_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_print_jobs_poll
  ON print_jobs (restaurante_id, status, created_at)
  WHERE status IN ('queued', 'error');

SELECT ct_ensure_trigger('trg_print_jobs_updated_at', 'print_jobs'::regclass);

ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS print_jobs_insert ON print_jobs;
CREATE POLICY print_jobs_insert ON print_jobs
  FOR INSERT TO authenticated
  WITH CHECK (restaurante_id = ct_current_restaurante_id());

DROP POLICY IF EXISTS print_jobs_select ON print_jobs;
CREATE POLICY print_jobs_select ON print_jobs
  FOR SELECT TO authenticated
  USING (restaurante_id = ct_current_restaurante_id());
