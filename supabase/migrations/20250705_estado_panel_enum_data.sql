-- Paso 2: migrar filas legacy → semáforo (transacción distinta al ADD VALUE)

UPDATE comandas_cocina SET estado_panel = 'sentados' WHERE estado_panel = 'pendiente';
UPDATE comandas_cocina SET estado_panel = 'bebidas' WHERE estado_panel = 'en_preparacion';
UPDATE comandas_cocina SET estado_panel = 'tiene_primeros' WHERE estado_panel = 'listo';
UPDATE comandas_cocina SET estado_panel = 'marcha_segundos' WHERE estado_panel = 'servido';

UPDATE comandas_postres SET estado_panel = 'sentados' WHERE estado_panel = 'pendiente';
UPDATE comandas_postres SET estado_panel = 'bebidas' WHERE estado_panel = 'en_preparacion';
UPDATE comandas_postres SET estado_panel = 'tiene_primeros' WHERE estado_panel = 'listo';
UPDATE comandas_postres SET estado_panel = 'marcha_segundos' WHERE estado_panel = 'servido';
