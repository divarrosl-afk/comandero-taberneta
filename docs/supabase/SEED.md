# Seed inicial Supabase — Fase 1

Este documento describe cómo preparar el proyecto Supabase para **Comandero Taberneta** sin guardar contraseñas en el repositorio.

## Requisitos previos

1. Proyecto Supabase creado.
2. Ejecutar `supabase/schema.sql` en el SQL Editor (incluye restaurante seed y tabla `config_impresora`).
3. Variables en `.env.local` (ver `.env.example`).

## Variables de entorno

```env
NEXT_PUBLIC_DATA_BACKEND=supabase
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_RESTAURANTE_ID=b1c2d3e4-f5a6-4789-a012-3456789abcde
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # solo servidor / scripts
```

## 1. Restaurante

El esquema inserta automáticamente:

- **ID:** `b1c2d3e4-f5a6-4789-a012-3456789abcde`
- **Nombre:** La Taberneta de Ca la Ingrid
- **Slug:** `la-taberneta`

Usa ese UUID en `NEXT_PUBLIC_RESTAURANTE_ID`.

## 2. Usuarios Auth + perfiles

Los logins usan **username** en la UI. En Supabase Auth el email es sintético:

| Username | Email Auth              | Rol sugerido |
|----------|-------------------------|--------------|
| divarro  | divarro@taberneta.local | ADMIN        |
| david    | david@taberneta.local   | CAMARERO     |
| ingrid   | ingrid@taberneta.local  | CAMARERO     |
| cocina   | cocina@taberneta.local  | CAMARERO     |

### Opción A — Script automatizado

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://..."
export SUPABASE_SERVICE_ROLE_KEY="eyJ..."
export NEXT_PUBLIC_RESTAURANTE_ID="b1c2d3e4-f5a6-4789-a012-3456789abcde"

# Contraseñas por variable (no las commitees)
export SEED_ADMIN_PASSWORD="tu-password-seguro"
export SEED_CAMARERO_PASSWORD="otra-password"

node scripts/seed-supabase.mjs
```

### Opción B — Manual en Supabase Dashboard

1. **Authentication → Users → Add user** para cada cuenta (`*@taberneta.local`).
2. En **SQL Editor**, insertar filas en `perfiles` enlazando `auth_user_id`:

```sql
INSERT INTO perfiles (
  auth_user_id,
  restaurante_id,
  username,
  nombre,
  rol,
  camarero_id,
  activo
) VALUES (
  'UUID-DEL-USUARIO-AUTH',
  'b1c2d3e4-f5a6-4789-a012-3456789abcde',
  'divarro',
  'Divarro',
  'ADMIN',
  NULL,
  TRUE
);
```

Repite para david, ingrid y cocina (`camarero_id` = username para camareros).

## 3. Mesas, carta y menú del día

Tras el primer login como **admin**:

1. **Configuración → Mesas** → «Restaurar distribución por defecto» (inserta mesas reales en Supabase).
2. **Configuración → Carta** → «Restaurar catálogo por defecto».
3. **Configuración → Menú del día** → guardar el menú activo.

O ejecuta el script de seed que también puede cargar mesas y productos si las variables están definidas.

## 4. Config impresora (opcional)

En **Configuración → Impresora**, guarda nombre/IP/puerto. Solo metadata compartida; la impresión real sigue en modo mock/local.

## 5. Probar login

1. `npm run dev`
2. Abre `/login`
3. Usuario `divarro` + contraseña definida en seed
4. La barra superior debe mostrar «cloud» si `DATA_BACKEND=supabase`

## 6. Probar datos compartidos

1. Dispositivo A: edita un plato en Carta o activa el menú del día.
2. Dispositivo B: recarga la app con la misma cuenta/restaurante.
3. Los cambios deben verse en carta, menú y mesas.

**Nota Fase 1:** comandas, postres e historial siguen en `localStorage` por dispositivo.

## 7. Volver a modo local

En `.env.local`:

```env
NEXT_PUBLIC_DATA_BACKEND=local
```

Reinicia `npm run dev`. La app vuelve a usar solo `localStorage` sin tocar Supabase.

## Seguridad

- No subas `SUPABASE_SERVICE_ROLE_KEY` ni contraseñas al repo.
- Desactiva usuarios con `activo = false` en `perfiles`; no podrán entrar aunque existan en Auth.
- Solo **ADMIN** puede escribir carta, menú, mesas e impresora (RLS).
