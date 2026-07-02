-- Helpers idempotentes para migraciones repetibles (Comandero Taberneta)
-- Cargar antes de schema.sql y migraciones.

CREATE OR REPLACE FUNCTION ct_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION ct_ensure_trigger(
  p_trigger TEXT,
  p_table REGCLASS
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    WHERE t.tgname = p_trigger
      AND t.tgrelid = p_table
      AND NOT t.tgisinternal
  ) THEN
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION ct_set_updated_at()',
      p_trigger,
      p_table
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION ct_ensure_publication_table(
  p_publication TEXT,
  p_table TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables pt
    WHERE pt.pubname = p_publication
      AND pt.schemaname = 'public'
      AND pt.tablename = p_table
  ) THEN
    EXECUTE format(
      'ALTER PUBLICATION %I ADD TABLE %I',
      p_publication,
      p_table
    );
  END IF;
END;
$$;
