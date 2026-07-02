ALTER TABLE menus_dia
  ADD COLUMN IF NOT EXISTS primeros_importados JSONB,
  ADD COLUMN IF NOT EXISTS segundos_importados JSONB;
