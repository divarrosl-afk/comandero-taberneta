-- Migración Fase 1: función ct_touch_ultimo_acceso
-- Permite registrar último acceso sin abrir UPDATE de perfiles a no-admin.

CREATE OR REPLACE FUNCTION ct_touch_ultimo_acceso()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE perfiles
  SET ultimo_acceso = NOW()
  WHERE auth_user_id = auth.uid()
    AND activo = TRUE
    AND deleted_at IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION ct_touch_ultimo_acceso() TO authenticated;
