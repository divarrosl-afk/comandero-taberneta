-- Habilitar Realtime para comandas (Fase 2, idempotente)
-- Requiere supabase/idempotent_helpers.sql

SELECT ct_ensure_publication_table('supabase_realtime', 'comandas_cocina');
SELECT ct_ensure_publication_table('supabase_realtime', 'comandas_postres');
