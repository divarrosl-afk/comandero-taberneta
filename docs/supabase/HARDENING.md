# Fase A — Hardening

Auditoría de robustez y seguridad. **Sin funciones nuevas.**

## Migración obligatoria (Supabase)

Ejecutar en SQL Editor después de Fase 2:

```bash
# Archivo: supabase/migrations/20250702_rls_hardening.sql
```

### Cambios RLS

| Tabla | Cambio |
|-------|--------|
| `comandas_cocina` | UPDATE: solo ADMIN puede establecer `deleted_at` (soft-delete) |
| `comandas_postres` | Idem |
| `audit_log` | INSERT: solo ADMIN |

**Antes:** un CAMARERO podía anular comandas vía `UPDATE deleted_at` aunque la UI lo ocultara.

## Auditoría RLS (resumen)

| Recurso | SELECT | INSERT | UPDATE | DELETE / soft-delete |
|---------|--------|--------|--------|----------------------|
| `restaurantes` | autenticado (propio) | — | — | — |
| `perfiles` | autenticado | — | ADMIN | ADMIN |
| `mesas` | autenticado (+ activa si CAMARERO) | ADMIN | ADMIN | ADMIN (soft via admin_write) |
| `mesa_estados` | autenticado | autenticado | autenticado | ADMIN |
| `productos` | autenticado (+ activo si CAMARERO) | ADMIN | ADMIN | ADMIN |
| `menus_dia` | autenticado | ADMIN | ADMIN | ADMIN |
| `comandas_cocina` | autenticado | autenticado | autenticado (estado); ADMIN (anular) | ADMIN (SQL DELETE) |
| `comandas_postres` | idem | idem | idem | idem |
| `cierres` | ADMIN | ADMIN | ADMIN | ADMIN |
| `audit_log` | ADMIN | ADMIN | — | — |
| `config_impresora` | autenticado | ADMIN | ADMIN | ADMIN |

`ct_touch_ultimo_acceso()` — función SECURITY DEFINER para `ultimo_acceso` sin abrir UPDATE general en perfiles.

## APIs

| Ruta | Auth | Validación |
|------|------|------------|
| `POST /api/admin/usuarios` | Bearer + ADMIN | username, password ≥6, rol enum |
| `PATCH /api/admin/usuarios/[username]` | Bearer + ADMIN | rol enum, password ≥6 si se envía |
| `POST /api/impresion` | Bearer CAMARERO/ADMIN si `supabase`/`hybrid` | ticket, destino, tipo |

Modo `local`: `/api/impresion` sin auth (mismo comportamiento que antes).

## Cliente — sync y rendimiento

- `fetchOperativaData()` — deduplica peticiones concurrentes (polling + Realtime).
- `OPERATIVA_POLL_MS = 5000` — constante compartida.
- Repositorios Supabase — errores de lectura propagados (no silencian con `[]`).
- `useSupabaseOperativaRealtime` — cleanup con `removeChannel` en unmount.

## Qué queda para Fase B (tests)

- Tests unitarios de `mergeOperativa`, permisos, repos.
- Simulación multi-móvil concurrente.
- Tests de RLS con roles CAMARERO/ADMIN.

## Qué queda para Fases C–E

Ver roadmap del proyecto (optimización, offline serio, impresora TCP 9100).
