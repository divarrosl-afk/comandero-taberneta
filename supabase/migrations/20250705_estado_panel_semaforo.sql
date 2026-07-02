-- Semáforo de marcha: amplía ct_estado_panel y migra valores legacy

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

UPDATE comandas_cocina SET estado_panel = 'sentados' WHERE estado_panel = 'pendiente';
UPDATE comandas_cocina SET estado_panel = 'bebidas' WHERE estado_panel = 'en_preparacion';
UPDATE comandas_cocina SET estado_panel = 'tiene_primeros' WHERE estado_panel = 'listo';
UPDATE comandas_cocina SET estado_panel = 'marcha_segundos' WHERE estado_panel = 'servido';

UPDATE comandas_postres SET estado_panel = 'sentados' WHERE estado_panel = 'pendiente';
UPDATE comandas_postres SET estado_panel = 'bebidas' WHERE estado_panel = 'en_preparacion';
UPDATE comandas_postres SET estado_panel = 'tiene_primeros' WHERE estado_panel = 'listo';
UPDATE comandas_postres SET estado_panel = 'marcha_segundos' WHERE estado_panel = 'servido';
