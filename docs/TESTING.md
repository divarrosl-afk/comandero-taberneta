# Testing — Comandero Taberneta

## Stack

- **Vitest** — runner
- **happy-dom** — `localStorage` y entorno DOM ligero
- Sin Supabase real en CI (mocks cuando hace falta)

## Scripts

```bash
npm run test          # una pasada
npm run test:watch    # modo watch
npm run build         # build producción
npm run lint          # ESLint
```

## Estructura

```
tests/
  setup/           # vitest.setup.ts, fixtures
  unit/            # funciones puras y módulos aislados
  storage/         # localStorage
  repos/           # *-repository-local
  integration/     # flujos sin Supabase real
```

Cada test arranca con:

- `NEXT_PUBLIC_DATA_BACKEND=local` (tests de sync remoto hacen `vi.stubEnv(..., "supabase")` en su `beforeEach`)
- `localStorage` vacío + IndexedDB reset (`fake-indexeddb`)
- `resetDataLayerForTests()`

## Qué cubre

| Área | Archivos |
|------|----------|
| Permisos / roles | `unit/auth/permisos.test.ts`, `seguridad-permisos.test.ts` |
| Auth local | `unit/auth/seguridad.test.ts`, `repos/auth-repository-local.test.ts` |
| Backend selector | `unit/data/backend.test.ts` |
| Sync | `unit/sync/*`, `integration/operativa-fetch.test.ts`, `integration/operativa-read-offline.test.ts` |
| Mesas | `unit/mesas/estado-mesa.test.ts` |
| Catálogo | `unit/catalogo/search.test.ts` |
| Tickets | `unit/format/format-ticket.test.ts` |
| Cierre | `unit/cierre/*` |
| Repos locales | `repos/*.test.ts` |
| Flujo integración | `integration/flujo-operativo.test.ts` |

## CI

GitHub Actions (`.github/workflows/ci.yml`):

1. `npm run build`
2. `npm run lint`
3. `npm run test`

## Supabase en tests

No se usa Supabase real. Los repositorios remotos se mockean con `vi.mock` y `vi.stubEnv("NEXT_PUBLIC_DATA_BACKEND", "supabase")` en tests de sync (véase `sync-worker.test.ts`, `outbox-migrate.test.ts`).

Para probar RLS en entorno real: ejecutar migraciones en Supabase y pruebas manuales multi-móvil (ver `docs/supabase/FASE2.md`).

## Migraciones Supabase (manual)

```bash
SUPABASE_DB_URL="postgresql://..." node scripts/apply-migrations.mjs
```

Aplica `20250702_rls_hardening.sql` y `20250703_drop_ct_is_camarero.sql`.

## Próximo paso (simulación restaurante)

Fase B+ / ampliación: script con N clientes concurrentes contra Supabase de staging (fuera de CI).
