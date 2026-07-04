-- Paso 1: ampliar ct_estado_panel (debe ir en transacción separada del UPDATE)

DO $$ BEGIN
  ALTER TYPE ct_estado_panel ADD VALUE IF NOT EXISTS 'sentados';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE ct_estado_panel ADD VALUE IF NOT EXISTS 'bebidas';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE ct_estado_panel ADD VALUE IF NOT EXISTS 'tapas';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE ct_estado_panel ADD VALUE IF NOT EXISTS 'marcha_1';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE ct_estado_panel ADD VALUE IF NOT EXISTS 'tiene_primeros';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE ct_estado_panel ADD VALUE IF NOT EXISTS 'marcha_segundos';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE ct_estado_panel ADD VALUE IF NOT EXISTS 'segundos';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE ct_estado_panel ADD VALUE IF NOT EXISTS 'marcha_postres';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE ct_estado_panel ADD VALUE IF NOT EXISTS 'tiene_postres';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE ct_estado_panel ADD VALUE IF NOT EXISTS 'marcha_cafes';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE ct_estado_panel ADD VALUE IF NOT EXISTS 'tiene_cafes';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE ct_estado_panel ADD VALUE IF NOT EXISTS 'marcha_cuenta';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE ct_estado_panel ADD VALUE IF NOT EXISTS 'mesa_libre';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
