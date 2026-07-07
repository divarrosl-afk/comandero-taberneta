-- Permite soft-delete de comandas a camareros del restaurante (panel / historial).

DROP POLICY IF EXISTS comandas_cocina_update ON comandas_cocina;
CREATE POLICY comandas_cocina_update ON comandas_cocina
  FOR UPDATE TO authenticated
  USING (
    restaurante_id = ct_current_restaurante_id()
    AND deleted_at IS NULL
  )
  WITH CHECK (restaurante_id = ct_current_restaurante_id());

DROP POLICY IF EXISTS comandas_postres_update ON comandas_postres;
CREATE POLICY comandas_postres_update ON comandas_postres
  FOR UPDATE TO authenticated
  USING (
    restaurante_id = ct_current_restaurante_id()
    AND deleted_at IS NULL
  )
  WITH CHECK (restaurante_id = ct_current_restaurante_id());
