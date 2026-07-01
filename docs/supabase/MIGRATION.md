# Guía de migración localStorage → Supabase

## Principio

**Nunca romper la app en producción.** Cada fase debe poder desplegarse con `NEXT_PUBLIC_DATA_BACKEND=local`.

## Mapeo localStorage → Supabase

| Clave localStorage | Tabla(s) Supabase | Fase |
|--------------------|-------------------|------|
| `comandero-taberneta:usuarios` | `perfiles` + Supabase Auth | 1 |
| `comandero-taberneta:sesion` | Supabase Auth session | 1 |
| `comandero-taberneta:mesas` | `mesas` | 1 |
| `comandero-taberneta:mesas-estado` | `mesa_estados` | 2 |
| `comandero-taberneta:catalogo` | `productos` | 1 |
| `comandero-taberneta:menu-dia` | `menus_dia` | 1 |
| `comandero-taberneta:comandas` | `comandas_cocina` | 2 |
| `comandero-taberneta:postres` | `comandas_postres` | 2 |
| `comandero-taberneta:borrador` | — (sigue local) | — |
| `comandero-taberneta:borrador-postres` | — (sigue local) | — |
| `comandero-taberneta:impresora-config` | snapshot en `cierres` / config local | 6 |

## Transformaciones al migrar

### Usuarios

```
localStorage Usuario
  username      → perfiles.username
  password      → Supabase Auth (hash) — NO copiar texto plano
  rol           → perfiles.rol
  nombre        → perfiles.nombre
  camareroId    → perfiles.camarero_id
  activo        → perfiles.activo
  ultimoAcceso  → perfiles.ultimo_acceso
  creadoEn      → perfiles.created_at
```

Email Auth interno: `{username}@taberneta.local`

### Mesas

IDs UUID actuales se conservan. Campos snake_case en SQL.

### Productos

Ejecutar `migrarProducto()` antes de insertar (ya existe en `src/lib/carta/migrate-producto.ts`).

### Comandas cocina

```
ComandaCocina
  id            → comandas_cocina.id
  mesa          → mesa_codigo (+ mesa_id si existe FK)
  camarero      → camarero_nombre (+ username si se resuelve)
  tipoServicio  → tipo_servicio
  entrantes…    → columnas jsonb
  extras        → extras jsonb
  observaciones → observaciones jsonb
  creadaEn      → creada_en
  enviada       → enviada
  estadoPanel   → estado_panel
```

### Cierre

Export JSON (`ExportacionCierre`) → fila en `cierres.snapshot` + `resumen` calculado.

## Estrategia por backend

### `local` (actual, default)

```
Hook → storage/*.ts → localStorage
```

Sin cambios. Comportamiento idéntico al de hoy.

### `supabase` (staging / pruebas)

```
Hook → Repository → Supabase client → Postgres
```

Sin cache local. Requiere red.

### `hybrid` (producción futura)

```
Hook → HybridRepository
  ├─ write: localStorage/IndexedDB (inmediato)
  ├─ enqueue: cola sync
  └─ sync worker → Supabase (cuando hay red)
```

Cola offline **no implementada en Fase 0**. Solo documentada.

## Script de migración one-shot (Fase 1–2)

Pseudoflujo `scripts/migrate-local-to-supabase.ts` (futuro):

1. Leer todas las claves `comandero-taberneta:*` del navegador o JSON exportado
2. Validar con normalizadores existentes
3. Crear usuarios en Auth + `perfiles`
4. Upsert mesas, productos, menú del día
5. Upsert comandas/postres del día (por `id`)
6. Verificar conteos
7. **No borrar** localStorage hasta confirmación manual

Idempotencia: todos los upserts por `id` UUID.

## Evitar pérdida de comandas (Fase 2)

1. UUID generado en cliente **antes** de guardar
2. Escritura local inmediata (UI optimista)
3. Cola persistente IndexedDB con `idempotency_key`
4. Upsert Supabase por `id`
5. Banner “N pendientes de sincronizar”
6. Reintentos con backoff exponencial
7. No eliminar de cola local hasta ACK del servidor

## Rollback

Si Supabase falla en producción:

1. Cambiar `NEXT_PUBLIC_DATA_BACKEND=local`
2. Redeploy
3. La app vuelve a localStorage sin cambios de código

## Checklist pre-migración

- [ ] Ejecutar `supabase/schema.sql` en proyecto Supabase
- [ ] Copiar `NEXT_PUBLIC_RESTAURANTE_ID` del seed
- [ ] Exportar cierre JSON del día como backup
- [ ] Probar en staging con `DATA_BACKEND=supabase`
- [ ] Validar RLS con usuario ADMIN y CAMARERO
- [ ] Solo entonces activar `hybrid` en producción

## Qué no migrar

- Borradores de formulario
- Tokens de sesión localStorage antiguos
- Cache de service worker PWA

## Compatibilidad de tipos

Los tipos TypeScript en `src/types/*` **no cambian en Fase 0**.
Los repositorios Supabase mapearán filas SQL ↔ tipos existentes en fases futuras.
