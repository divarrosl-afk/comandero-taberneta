-- Migración Fase 1: tabla config_impresora (idempotente)
-- Requiere supabase/idempotent_helpers.sql

CREATE TABLE IF NOT EXISTS config_impresora (
  restaurante_id    UUID PRIMARY KEY REFERENCES restaurantes (id) ON DELETE CASCADE,
  nombre            TEXT NOT NULL DEFAULT 'Impresora principal',
  ip                TEXT NOT NULL DEFAULT '',
  puerto            INTEGER NOT NULL DEFAULT 9100,
  ancho_papel       TEXT NOT NULL DEFAULT '80mm'
    CHECK (ancho_papel IN ('58mm', '80mm')),
  activa            BOOLEAN NOT NULL DEFAULT TRUE,
  modo              TEXT NOT NULL DEFAULT 'mock'
    CHECK (modo IN ('mock', 'network')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT ct_ensure_trigger('trg_config_impresora_updated_at', 'config_impresora'::regclass);

ALTER TABLE config_impresora ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS config_impresora_select ON config_impresora;
CREATE POLICY config_impresora_select ON config_impresora
  FOR SELECT TO authenticated
  USING (restaurante_id = ct_current_restaurante_id());

DROP POLICY IF EXISTS config_impresora_admin_write ON config_impresora;
CREATE POLICY config_impresora_admin_write ON config_impresora
  FOR ALL TO authenticated
  USING (restaurante_id = ct_current_restaurante_id() AND ct_is_admin())
  WITH CHECK (restaurante_id = ct_current_restaurante_id() AND ct_is_admin());
