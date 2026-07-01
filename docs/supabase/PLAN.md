# Plan de migración a Supabase — Comandero Taberneta

## Estado: Fase 2 (comandas y postres sincronizados)

Con `NEXT_PUBLIC_DATA_BACKEND=supabase` o `hybrid`:

- Todo lo de Fase 1
- Comandas cocina y postres en Supabase (JSONB)
- Panel, historial, cierre y estado de mesas compartidos entre móviles
- Realtime + polling; copia local de emergencia si falla la red

Con `NEXT_PUBLIC_DATA_BACKEND=local` (por defecto) la app funciona igual que antes.

## Contexto

Hoy el comandero persiste todo en **localStorage** (12 claves bajo `comandero-taberneta:*`).
Cada móvil tiene sus propios datos. Para servicio real, todos los dispositivos deben ver lo mismo.

## Objetivo global

Arquitectura **híbrida**:

| Capa | Rol |
|------|-----|
| **Supabase** | Fuente principal compartida (usuarios, carta, comandas, cierre) |
| **localStorage / IndexedDB** | Fallback, cache y cola offline (fases futuras) |
| **Repositorios** | Interfaz única; implementación local o remota según `DATA_BACKEND` |

## Decisiones base (aprobadas)

1. **Un restaurante** por ahora: *La Taberneta de Ca la Ingrid*.
   El esquema incluye `restaurante_id` para multi-local futuro.

2. **Login por username** (`divarro`, `david`, `ingrid`, `cocina`).
   Supabase Auth usará email interno (`{username}@taberneta.local`) en fases posteriores.

3. **Comandas en JSONB** al inicio (misma forma que `ComandaCocina` / `ComandaPostres` en TypeScript).
   Normalización a tablas de líneas en una fase posterior.

4. **Offline sync**: no implementado en Fase 0.
   Solo documentado en `MIGRATION.md`.

## Qué NO toca esta fase

- Comportamiento de la app en producción
- Sustitución de localStorage
- Impresión Wi-Fi / print-server
- Integración Ágora
- UI operativa (comanda, panel, mesas…)

## Roadmap por fases

### Fase 0 — Preparación (actual)

- [x] Documentación (`PLAN`, `SCHEMA`, `MIGRATION`)
- [x] `supabase/schema.sql` con tablas, enums, RLS
- [x] `src/lib/data/backend.ts`
- [x] `src/lib/supabase/env.ts`
- [x] `.env.example` actualizado

### Fase 1 — Auth + configuración compartida

- [x] Supabase Auth + tabla `perfiles`
- [x] Repositorios híbridos (auth, usuarios, catálogo, menú, mesas, impresora)
- [x] `DATA_BACKEND=supabase|hybrid` con fallback local
- [x] API admin usuarios (service role)
- [x] `docs/supabase/SEED.md` + `scripts/seed-supabase.mjs`
- [x] Comandas/postres **siguen en localStorage**

### Fase 2 — Comandas sincronizadas

- [x] `ComandasRepository` + `PostresRepository` (local / Supabase)
- [x] Panel, historial, cierre y mesas desde datos compartidos
- [x] Realtime + polling 5 s
- [x] Copia local de emergencia + banner de aviso
- [x] `docs/supabase/FASE2.md`

### Fase 3 — Cierre en nube

- Tabla `cierres` con snapshot JSON
- Historial unificado desde Supabase

### Fase 4 — Seguridad avanzada

- Contraseñas solo en Auth (hash)
- PIN rápido camarero
- `audit_log` en acciones críticas

### Fase 5 — Panel profesional

- Edición de comanda enviada
- Anular líneas
- Cobrado integrado con `mesa_estados`

### Fase 6 — Impresora real (paralelo)

- Print-server en LAN del restaurante
- Config en Supabase; ejecución local

### Fase 7 — Datos reales

- Import carta Taberneta
- Menú del día real

## Patrón de repositorios (existente → objetivo)

```
Hooks / componentes
       ↓
Repository (interfaz)
       ↓
┌──────────────┬────────────────┬──────────────┐
│ LocalRepo    │ SupabaseRepo   │ HybridRepo   │
└──────────────┴────────────────┴──────────────┘
```

Ya implementado para: `usuarios`, `mesas`.
Pendiente en fases futuras: catálogo, menú, comandas, postres, cierre.

## Variables de entorno

Ver `.env.example`. Resumen:

| Variable | Fase 0 | Uso futuro |
|----------|--------|------------|
| `NEXT_PUBLIC_DATA_BACKEND` | `local` | Selector de backend |
| `NEXT_PUBLIC_SUPABASE_URL` | vacío | Cliente Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | vacío | Cliente público |
| `NEXT_PUBLIC_RESTAURANTE_ID` | vacío | RLS multi-tenant |
| `SUPABASE_SERVICE_ROLE_KEY` | vacío | Migraciones server-side |

## Criterios de éxito Fase 0

- `npm run build` pasa sin cambios de comportamiento
- Esquema SQL ejecutable en Supabase SQL Editor
- Documentación alineada con tipos TypeScript actuales
- `getDataBackend()` devuelve `local` por defecto
