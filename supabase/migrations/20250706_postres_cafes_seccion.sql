-- Cafés e infusiones en comanda postres (sección separada del ticket)

ALTER TABLE comandas_postres
  ADD COLUMN IF NOT EXISTS cafes JSONB NOT NULL DEFAULT '[]'::JSONB;

ALTER TABLE comandas_postres
  ADD COLUMN IF NOT EXISTS estado_x_cafe TEXT
  CHECK (estado_x_cafe IS NULL OR estado_x_cafe IN ('sin_cafe'));
