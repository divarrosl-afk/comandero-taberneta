-- =============================================================================
-- Comandero Taberneta — Esquema inicial Supabase (idempotente)
-- Requiere supabase/idempotent_helpers.sql antes de ejecutar.
-- =============================================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE ct_rol AS ENUM ('ADMIN', 'CAMARERO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ct_estado_mesa AS ENUM ('libre',
  'ocupada',
  'pendiente',
  'servida',
  'cobrando');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ct_estado_panel AS ENUM (
    'pendiente',
    'en_preparacion',
    'listo',
    'servido',
    'sentados',
    'bebidas',
    'tapas',
    'marcha_1',
    'tiene_primeros',
    'marcha_segundos',
    'segundos',
    'marcha_postres',
    'tiene_postres',
    'marcha_cafes',
    'tiene_cafes',
    'marcha_cuenta',
    'mesa_libre'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ct_zona_mesa AS ENUM ('comedor',
  'barra',
  'fachada',
  'terraza',
  'rambla');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ct_seccion_catalogo AS ENUM ('entrantes',
  'primeros',
  'segundos',
  'bebidas',
  'postres',
  'extras',
  'salsas');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ct_tipo_servicio AS ENUM ('menu', 'carta', 'mixto');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- UTILIDADES
-- =============================================================================

-- =============================================================================
-- RESTAURANTES (multi-tenant root)
-- =============================================================================

CREATE TABLE IF NOT EXISTS restaurantes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

SELECT ct_ensure_trigger('trg_restaurantes_updated_at', 'restaurantes'::regclass);

-- =============================================================================
-- PERFILES (extiende auth.users — Fase 1)
-- =============================================================================

CREATE TABLE IF NOT EXISTS perfiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id      UUID UNIQUE REFERENCES auth.users (id) ON DELETE SET NULL,
  restaurante_id    UUID NOT NULL REFERENCES restaurantes (id) ON DELETE CASCADE,
  username          TEXT NOT NULL,
  nombre            TEXT NOT NULL,
  rol               ct_rol NOT NULL DEFAULT 'CAMARERO',
  camarero_id       TEXT,
  activo            BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_acceso     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  CONSTRAINT perfiles_username_restaurante_unique UNIQUE (restaurante_id, username),
  CONSTRAINT perfiles_username_format CHECK (username = LOWER(username))
);

CREATE INDEX IF NOT EXISTS idx_perfiles_restaurante ON perfiles (restaurante_id);
CREATE INDEX IF NOT EXISTS idx_perfiles_auth_user ON perfiles (auth_user_id) WHERE auth_user_id IS NOT NULL;

SELECT ct_ensure_trigger('trg_perfiles_updated_at', 'perfiles'::regclass);

-- =============================================================================
-- MESAS (configuración)
-- =============================================================================

CREATE TABLE IF NOT EXISTS mesas (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id      UUID NOT NULL REFERENCES restaurantes (id) ON DELETE CASCADE,
  codigo              TEXT NOT NULL,
  nombre_visible      TEXT NOT NULL,
  zona                ct_zona_mesa NOT NULL,
  activa              BOOLEAN NOT NULL DEFAULT TRUE,
  orden               INTEGER NOT NULL DEFAULT 0,
  permite_variante_b  BOOLEAN NOT NULL DEFAULT FALSE,
  es_variante_b       BOOLEAN NOT NULL DEFAULT FALSE,
  mesa_principal_id   UUID REFERENCES mesas (id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,
  CONSTRAINT mesas_codigo_restaurante_unique UNIQUE (restaurante_id, codigo),
  CONSTRAINT mesas_codigo_uppercase CHECK (codigo = UPPER(codigo))
);

CREATE INDEX IF NOT EXISTS idx_mesas_restaurante ON mesas (restaurante_id);
CREATE INDEX IF NOT EXISTS idx_mesas_restaurante_zona ON mesas (restaurante_id, zona);
CREATE INDEX IF NOT EXISTS idx_mesas_restaurante_activa ON mesas (restaurante_id, activa) WHERE deleted_at IS NULL;

SELECT ct_ensure_trigger('trg_mesas_updated_at', 'mesas'::regclass);

-- =============================================================================
-- MESA ESTADOS (operativo)
-- =============================================================================

CREATE TABLE IF NOT EXISTS mesa_estados (
  mesa_id           UUID PRIMARY KEY REFERENCES mesas (id) ON DELETE CASCADE,
  restaurante_id    UUID NOT NULL REFERENCES restaurantes (id) ON DELETE CASCADE,
  estado            ct_estado_mesa NOT NULL DEFAULT 'libre',
  manual            BOOLEAN NOT NULL DEFAULT FALSE,
  actualizada_en    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mesa_estados_restaurante ON mesa_estados (restaurante_id);
CREATE INDEX IF NOT EXISTS idx_mesa_estados_estado ON mesa_estados (restaurante_id, estado);

SELECT ct_ensure_trigger('trg_mesa_estados_updated_at', 'mesa_estados'::regclass);

-- =============================================================================
-- PRODUCTOS (carta / catálogo)
-- =============================================================================

CREATE TABLE IF NOT EXISTS productos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id        UUID NOT NULL REFERENCES restaurantes (id) ON DELETE CASCADE,
  nombre                TEXT NOT NULL,
  nombre_corto          TEXT,
  seccion               ct_seccion_catalogo NOT NULL,
  tipo                  TEXT NOT NULL DEFAULT 'ambos'
    CHECK (tipo IN ('carta', 'menu-dia', 'ambos')),
  precio_carta          NUMERIC(10, 2),
  precio_menu           NUMERIC(10, 2),
  suplemento            NUMERIC(10, 2),
  activo                BOOLEAN NOT NULL DEFAULT TRUE,
  agotado               BOOLEAN NOT NULL DEFAULT FALSE,
  favorito              BOOLEAN NOT NULL DEFAULT FALSE,
  recomendado           BOOLEAN NOT NULL DEFAULT FALSE,
  orden                 INTEGER NOT NULL DEFAULT 0,
  descripcion_camarero  TEXT,
  ingredientes          JSONB NOT NULL DEFAULT '[]'::JSONB,
  alergenos             JSONB NOT NULL DEFAULT '[]'::JSONB,
  notas_internas        TEXT,
  tiempo_preparacion    INTEGER,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_productos_restaurante ON productos (restaurante_id);
CREATE INDEX IF NOT EXISTS idx_productos_restaurante_seccion ON productos (restaurante_id, seccion);
CREATE INDEX IF NOT EXISTS idx_productos_restaurante_activo ON productos (restaurante_id, activo)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_productos_ingredientes_gin ON productos USING GIN (ingredientes);

SELECT ct_ensure_trigger('trg_productos_updated_at', 'productos'::regclass);

-- =============================================================================
-- MENÚS DEL DÍA
-- =============================================================================

CREATE TABLE IF NOT EXISTS menus_dia (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id          UUID NOT NULL REFERENCES restaurantes (id) ON DELETE CASCADE,
  fecha                   DATE NOT NULL,
  precio_menu             NUMERIC(10, 2) NOT NULL DEFAULT 14,
  primeros_ids            JSONB NOT NULL DEFAULT '[]'::JSONB,
  segundos_ids            JSONB NOT NULL DEFAULT '[]'::JSONB,
  postres_incluidos_ids   JSONB NOT NULL DEFAULT '[]'::JSONB,
  suplemento_primeros     NUMERIC(10, 2),
  suplemento_segundos     NUMERIC(10, 2),
  observaciones           TEXT,
  primeros_importados     JSONB,
  segundos_importados     JSONB,
  activo                  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at              TIMESTAMPTZ,
  CONSTRAINT menus_dia_fecha_restaurante_unique UNIQUE (restaurante_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_menus_dia_restaurante_fecha ON menus_dia (restaurante_id, fecha DESC);

SELECT ct_ensure_trigger('trg_menus_dia_updated_at', 'menus_dia'::regclass);

-- =============================================================================
-- COMANDAS COCINA (platos en JSONB — Fase 1 Supabase)
-- =============================================================================

CREATE TABLE IF NOT EXISTS comandas_cocina (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id      UUID NOT NULL REFERENCES restaurantes (id) ON DELETE CASCADE,
  mesa_codigo         TEXT NOT NULL,
  mesa_id             UUID REFERENCES mesas (id) ON DELETE SET NULL,
  camarero_username   TEXT,
  camarero_nombre     TEXT NOT NULL,
  tipo_servicio       ct_tipo_servicio NOT NULL DEFAULT 'mixto',
  entrantes           JSONB NOT NULL DEFAULT '[]'::JSONB,
  primeros            JSONB NOT NULL DEFAULT '[]'::JSONB,
  segundos            JSONB NOT NULL DEFAULT '[]'::JSONB,
  bebidas             JSONB NOT NULL DEFAULT '[]'::JSONB,
  extras              JSONB NOT NULL DEFAULT '[]'::JSONB,
  observaciones       JSONB NOT NULL DEFAULT '[]'::JSONB,
  estado_panel        ct_estado_panel NOT NULL DEFAULT 'pendiente',
  enviada             BOOLEAN NOT NULL DEFAULT TRUE,
  creada_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_comandas_cocina_restaurante ON comandas_cocina (restaurante_id);
CREATE INDEX IF NOT EXISTS idx_comandas_cocina_creada ON comandas_cocina (restaurante_id, creada_en DESC);
CREATE INDEX IF NOT EXISTS idx_comandas_cocina_mesa ON comandas_cocina (restaurante_id, mesa_codigo);
CREATE INDEX IF NOT EXISTS idx_comandas_cocina_estado ON comandas_cocina (restaurante_id, estado_panel)
  WHERE deleted_at IS NULL;

SELECT ct_ensure_trigger('trg_comandas_cocina_updated_at', 'comandas_cocina'::regclass);

-- =============================================================================
-- COMANDAS POSTRES
-- =============================================================================

CREATE TABLE IF NOT EXISTS comandas_postres (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id      UUID NOT NULL REFERENCES restaurantes (id) ON DELETE CASCADE,
  mesa_codigo         TEXT NOT NULL,
  mesa_id             UUID REFERENCES mesas (id) ON DELETE SET NULL,
  camarero_username   TEXT,
  camarero_nombre     TEXT NOT NULL,
  postres             JSONB NOT NULL DEFAULT '[]'::JSONB,
  estado_x            TEXT CHECK (estado_x IN ('sin_postre', 'pendiente', 'marcado')),
  cl_h                BOOLEAN NOT NULL DEFAULT FALSE,
  observaciones       JSONB NOT NULL DEFAULT '[]'::JSONB,
  estado_panel        ct_estado_panel NOT NULL DEFAULT 'pendiente',
  enviada             BOOLEAN NOT NULL DEFAULT TRUE,
  creada_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_comandas_postres_restaurante ON comandas_postres (restaurante_id);
CREATE INDEX IF NOT EXISTS idx_comandas_postres_creada ON comandas_postres (restaurante_id, creada_en DESC);
CREATE INDEX IF NOT EXISTS idx_comandas_postres_mesa ON comandas_postres (restaurante_id, mesa_codigo);

SELECT ct_ensure_trigger('trg_comandas_postres_updated_at', 'comandas_postres'::regclass);

-- =============================================================================
-- CIERRES (snapshot diario)
-- =============================================================================

CREATE TABLE IF NOT EXISTS cierres (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id          UUID NOT NULL REFERENCES restaurantes (id) ON DELETE CASCADE,
  fecha                   DATE NOT NULL,
  exportado_por_username  TEXT NOT NULL,
  exportado_por_nombre    TEXT NOT NULL,
  version                 TEXT NOT NULL DEFAULT '1.0',
  resumen                 JSONB NOT NULL DEFAULT '{}'::JSONB,
  snapshot                JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cierres_fecha_restaurante_unique UNIQUE (restaurante_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_cierres_restaurante_fecha ON cierres (restaurante_id, fecha DESC);

SELECT ct_ensure_trigger('trg_cierres_updated_at', 'cierres'::regclass);

-- =============================================================================
-- AUDIT LOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id    UUID NOT NULL REFERENCES restaurantes (id) ON DELETE CASCADE,
  actor_username    TEXT,
  accion            TEXT NOT NULL,
  entidad           TEXT NOT NULL,
  entidad_id        UUID,
  payload           JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_restaurante ON audit_log (restaurante_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entidad ON audit_log (restaurante_id, entidad, entidad_id);

-- =============================================================================
-- RLS — helpers
-- =============================================================================

CREATE OR REPLACE FUNCTION ct_current_restaurante_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.restaurante_id
  FROM perfiles p
  WHERE p.auth_user_id = auth.uid()
    AND p.activo = TRUE
    AND p.deleted_at IS NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION ct_current_rol()
RETURNS ct_rol
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.rol
  FROM perfiles p
  WHERE p.auth_user_id = auth.uid()
    AND p.activo = TRUE
    AND p.deleted_at IS NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION ct_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ct_current_rol() = 'ADMIN'::ct_rol;
$$;

-- =============================================================================
-- RLS — habilitar
-- =============================================================================

ALTER TABLE restaurantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesa_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus_dia ENABLE ROW LEVEL SECURITY;
ALTER TABLE comandas_cocina ENABLE ROW LEVEL SECURITY;
ALTER TABLE comandas_postres ENABLE ROW LEVEL SECURITY;
ALTER TABLE cierres ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS — restaurantes
-- =============================================================================

DROP POLICY IF EXISTS restaurantes_select ON restaurantes;
CREATE POLICY restaurantes_select ON restaurantes
  FOR SELECT TO authenticated
  USING (id = ct_current_restaurante_id());

-- =============================================================================
-- RLS — perfiles
-- =============================================================================

DROP POLICY IF EXISTS perfiles_select ON perfiles;
CREATE POLICY perfiles_select ON perfiles
  FOR SELECT TO authenticated
  USING (restaurante_id = ct_current_restaurante_id());

DROP POLICY IF EXISTS perfiles_admin_all ON perfiles;
CREATE POLICY perfiles_admin_all ON perfiles
  FOR ALL TO authenticated
  USING (restaurante_id = ct_current_restaurante_id() AND ct_is_admin())
  WITH CHECK (restaurante_id = ct_current_restaurante_id() AND ct_is_admin());

-- Actualizar ultimo_acceso propio sin abrir UPDATE general a no-admin
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

-- =============================================================================
-- RLS — mesas
-- =============================================================================

DROP POLICY IF EXISTS mesas_select ON mesas;
CREATE POLICY mesas_select ON mesas
  FOR SELECT TO authenticated
  USING (
    restaurante_id = ct_current_restaurante_id()
    AND deleted_at IS NULL
    AND (ct_is_admin() OR activa = TRUE)
  );

DROP POLICY IF EXISTS mesas_admin_write ON mesas;
CREATE POLICY mesas_admin_write ON mesas
  FOR ALL TO authenticated
  USING (restaurante_id = ct_current_restaurante_id() AND ct_is_admin())
  WITH CHECK (restaurante_id = ct_current_restaurante_id() AND ct_is_admin());

-- =============================================================================
-- RLS — mesa_estados
-- =============================================================================

DROP POLICY IF EXISTS mesa_estados_select ON mesa_estados;
CREATE POLICY mesa_estados_select ON mesa_estados
  FOR SELECT TO authenticated
  USING (restaurante_id = ct_current_restaurante_id());

DROP POLICY IF EXISTS mesa_estados_update ON mesa_estados;
CREATE POLICY mesa_estados_update ON mesa_estados
  FOR UPDATE TO authenticated
  USING (restaurante_id = ct_current_restaurante_id())
  WITH CHECK (restaurante_id = ct_current_restaurante_id());

DROP POLICY IF EXISTS mesa_estados_insert ON mesa_estados;
CREATE POLICY mesa_estados_insert ON mesa_estados
  FOR INSERT TO authenticated
  WITH CHECK (restaurante_id = ct_current_restaurante_id());

DROP POLICY IF EXISTS mesa_estados_admin_delete ON mesa_estados;
CREATE POLICY mesa_estados_admin_delete ON mesa_estados
  FOR DELETE TO authenticated
  USING (restaurante_id = ct_current_restaurante_id() AND ct_is_admin());

-- =============================================================================
-- RLS — productos
-- =============================================================================

DROP POLICY IF EXISTS productos_select ON productos;
CREATE POLICY productos_select ON productos
  FOR SELECT TO authenticated
  USING (
    restaurante_id = ct_current_restaurante_id()
    AND deleted_at IS NULL
    AND (ct_is_admin() OR activo = TRUE)
  );

DROP POLICY IF EXISTS productos_admin_write ON productos;
CREATE POLICY productos_admin_write ON productos
  FOR ALL TO authenticated
  USING (restaurante_id = ct_current_restaurante_id() AND ct_is_admin())
  WITH CHECK (restaurante_id = ct_current_restaurante_id() AND ct_is_admin());

-- =============================================================================
-- RLS — menus_dia
-- =============================================================================

DROP POLICY IF EXISTS menus_dia_select ON menus_dia;
CREATE POLICY menus_dia_select ON menus_dia
  FOR SELECT TO authenticated
  USING (
    restaurante_id = ct_current_restaurante_id()
    AND deleted_at IS NULL
    AND (ct_is_admin() OR activo = TRUE)
  );

DROP POLICY IF EXISTS menus_dia_admin_write ON menus_dia;
CREATE POLICY menus_dia_admin_write ON menus_dia
  FOR ALL TO authenticated
  USING (restaurante_id = ct_current_restaurante_id() AND ct_is_admin())
  WITH CHECK (restaurante_id = ct_current_restaurante_id() AND ct_is_admin());

-- =============================================================================
-- RLS — comandas_cocina
-- =============================================================================

DROP POLICY IF EXISTS comandas_cocina_select ON comandas_cocina;
CREATE POLICY comandas_cocina_select ON comandas_cocina
  FOR SELECT TO authenticated
  USING (
    restaurante_id = ct_current_restaurante_id()
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS comandas_cocina_insert ON comandas_cocina;
CREATE POLICY comandas_cocina_insert ON comandas_cocina
  FOR INSERT TO authenticated
  WITH CHECK (restaurante_id = ct_current_restaurante_id());

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

DROP POLICY IF EXISTS comandas_cocina_admin_delete ON comandas_cocina;
CREATE POLICY comandas_cocina_admin_delete ON comandas_cocina
  FOR DELETE TO authenticated
  USING (restaurante_id = ct_current_restaurante_id() AND ct_is_admin());

-- =============================================================================
-- RLS — comandas_postres
-- =============================================================================

DROP POLICY IF EXISTS comandas_postres_select ON comandas_postres;
CREATE POLICY comandas_postres_select ON comandas_postres
  FOR SELECT TO authenticated
  USING (
    restaurante_id = ct_current_restaurante_id()
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS comandas_postres_insert ON comandas_postres;
CREATE POLICY comandas_postres_insert ON comandas_postres
  FOR INSERT TO authenticated
  WITH CHECK (restaurante_id = ct_current_restaurante_id());

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

DROP POLICY IF EXISTS comandas_postres_admin_delete ON comandas_postres;
CREATE POLICY comandas_postres_admin_delete ON comandas_postres
  FOR DELETE TO authenticated
  USING (restaurante_id = ct_current_restaurante_id() AND ct_is_admin());

-- =============================================================================
-- RLS — cierres (solo ADMIN)
-- =============================================================================

DROP POLICY IF EXISTS cierres_admin_all ON cierres;
CREATE POLICY cierres_admin_all ON cierres
  FOR ALL TO authenticated
  USING (restaurante_id = ct_current_restaurante_id() AND ct_is_admin())
  WITH CHECK (restaurante_id = ct_current_restaurante_id() AND ct_is_admin());

-- =============================================================================
-- RLS — audit_log (lectura ADMIN)
-- =============================================================================

DROP POLICY IF EXISTS audit_log_admin_select ON audit_log;
CREATE POLICY audit_log_admin_select ON audit_log
  FOR SELECT TO authenticated
  USING (restaurante_id = ct_current_restaurante_id() AND ct_is_admin());

DROP POLICY IF EXISTS audit_log_insert ON audit_log;
CREATE POLICY audit_log_insert ON audit_log
  FOR INSERT TO authenticated
  WITH CHECK (
    restaurante_id = ct_current_restaurante_id()
    AND ct_is_admin()
  );

-- =============================================================================
-- CONFIG IMPRESORA (metadata compartida — Fase 1)
-- =============================================================================

CREATE TABLE IF NOT EXISTS config_impresora (
  restaurante_id    UUID PRIMARY KEY REFERENCES restaurantes (id) ON DELETE CASCADE,
  nombre            TEXT NOT NULL DEFAULT 'Impresora principal',
  ip                TEXT NOT NULL DEFAULT '',
  puerto            INTEGER NOT NULL DEFAULT 9100,
  ancho_papel       TEXT NOT NULL DEFAULT '80mm'
    CHECK (ancho_papel IN ('58mm', '80mm')),
  activa            BOOLEAN NOT NULL DEFAULT TRUE,
  modo              TEXT NOT NULL DEFAULT 'mock'
    CHECK (modo IN ('mock', 'network')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT ct_ensure_trigger('trg_config_impresora_updated_at', 'config_impresora'::regclass);

ALTER TABLE config_impresora ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS config_impresora_select ON config_impresora;
CREATE POLICY config_impresora_select ON config_impresora
  FOR SELECT TO authenticated
  USING (restaurante_id = ct_current_restaurante_id());

DROP POLICY IF EXISTS config_impresora_admin_write ON config_impresora;
CREATE POLICY config_impresora_admin_write ON config_impresora
  FOR ALL TO authenticated
  USING (restaurante_id = ct_current_restaurante_id() AND ct_is_admin())
  WITH CHECK (restaurante_id = ct_current_restaurante_id() AND ct_is_admin());

-- =============================================================================
-- SEED — La Taberneta de Ca la Ingrid
-- UUID fijo para desarrollo → NEXT_PUBLIC_RESTAURANTE_ID
-- =============================================================================

INSERT INTO restaurantes (id, nombre, slug, activo)
VALUES (
  'b1c2d3e4-f5a6-4789-a012-3456789abcde',
  'La Taberneta de Ca la Ingrid',
  'la-taberneta',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Realtime (Fase 2 — comandas sincronizadas)
-- =============================================================================
SELECT ct_ensure_publication_table('supabase_realtime', 'comandas_cocina');
SELECT ct_ensure_publication_table('supabase_realtime', 'comandas_postres');
-- ALTER PUBLICATION supabase_realtime ADD TABLE mesa_estados;
