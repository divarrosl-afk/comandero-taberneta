-- Fase A — Hardening RLS
-- 1. Impide soft-delete (deleted_at) a no-ADMIN en comandas
-- 2. Restringe INSERT en audit_log a ADMIN

DROP POLICY IF EXISTS comandas_cocina_update ON comandas_cocina;
CREATE POLICY comandas_cocina_update ON comandas_cocina
  FOR UPDATE TO authenticated
  USING (
    restaurante_id = ct_current_restaurante_id()
    AND deleted_at IS NULL
  )
  WITH CHECK (
    restaurante_id = ct_current_restaurante_id()
    AND (ct_is_admin() OR deleted_at IS NULL)
  );

DROP POLICY IF EXISTS comandas_postres_update ON comandas_postres;
CREATE POLICY comandas_postres_update ON comandas_postres
  FOR UPDATE TO authenticated
  USING (
    restaurante_id = ct_current_restaurante_id()
    AND deleted_at IS NULL
  )
  WITH CHECK (
    restaurante_id = ct_current_restaurante_id()
    AND (ct_is_admin() OR deleted_at IS NULL)
  );

DROP POLICY IF EXISTS audit_log_insert ON audit_log;
CREATE POLICY audit_log_insert ON audit_log
  FOR INSERT TO authenticated
  WITH CHECK (
    restaurante_id = ct_current_restaurante_id()
    AND ct_is_admin()
  );
