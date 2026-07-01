-- Habilitar Realtime para comandas (Fase 2)
-- Ejecutar en SQL Editor si las tablas aún no están en la publicación.

ALTER PUBLICATION supabase_realtime ADD TABLE comandas_cocina;
ALTER PUBLICATION supabase_realtime ADD TABLE comandas_postres;
