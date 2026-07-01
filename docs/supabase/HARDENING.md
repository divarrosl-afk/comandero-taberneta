# Fase A — Hardening (cerrada)

Auditoría de robustez y seguridad. **Sin funciones nuevas.**

**Estado:** Fase A cerrada — lista para Fase B (Tests).

---

## Migraciones Supabase (orden obligatorio)

Ejecutar en el **SQL Editor** de Supabase, en este orden, sobre un proyecto con `schema.sql` base:

| # | Archivo | Qué hace |
|---|---------|----------|
| 1 | `supabase/migrations/20250630_config_impresora.sql` | Tabla `config_impresora` |
| 2 | `supabase/migrations/20250630_touch_ultimo_acceso.sql` | `ct_touch_ultimo_acceso()` |
| 3 | `supabase/migrations/20250701_realtime_comandas.sql` | Realtime en comandas/postres |
| 4 | `supabase/migrations/20250702_rls_hardening.sql` | **RLS soft-delete + audit_log** |
| 5 | `supabase/migrations/20250703_drop_ct_is_camarero.sql` | Elimina función SQL sin uso |

> Proyecto nuevo: ejecutar `supabase/schema.sql` completo (ya incluye políticas finales) y solo las migraciones 3–5 si aplica.

### Verificar RLS aplicado

```sql
SELECT polname, tablename
FROM pg_policies
WHERE tablename IN ('comandas_cocina', 'comandas_postres', 'audit_log');
```

---

## RLS — resultado auditoría

| Recurso | SELECT | INSERT | UPDATE | Soft-delete (`deleted_at`) |
|---------|--------|--------|--------|----------------------------|
| `comandas_cocina` | autenticado | autenticado | estado: autenticado | **solo ADMIN** (pass 1) |
| `comandas_postres` | idem | idem | idem | **solo ADMIN** |
| `productos` / `mesas` / `menus_dia` | autenticado | ADMIN | ADMIN (`*_admin_write`) | solo ADMIN |
| `audit_log` | ADMIN | **solo ADMIN** | — | — |
| `cierres` | ADMIN | ADMIN | ADMIN | ADMIN |
| `perfiles` | autenticado | — | ADMIN | ADMIN |

- `ct_is_camarero()` **eliminada** — no se usaba en ninguna política.
- `ct_touch_ultimo_acceso()` — SECURITY DEFINER para `ultimo_acceso` sin abrir UPDATE general en perfiles.

---

## APIs

| Ruta | Auth | Validación |
|------|------|------------|
| `POST /api/admin/usuarios` | Bearer + ADMIN | username `a-z0-9_-` 2–32, password ≥6, rol enum, nombre ≤80 |
| `PATCH /api/admin/usuarios/[username]` | Bearer + ADMIN | rol enum, password ≥6 si se envía |
| `POST /api/impresion` | Bearer CAMARERO/ADMIN si `supabase`/`hybrid` | ticket, destino; 401 claro sin sesión |

- Auth extraída a `src/lib/supabase/api-auth.ts` (anon key).
- `SUPABASE_SERVICE_ROLE_KEY` solo en `src/lib/supabase/admin.ts` y scripts servidor — **nunca** `NEXT_PUBLIC_`.
- Modo `local`: `/api/impresion` sin auth (sin cambios).

---

## Sync

- `fetchOperativaData()` — una petición en vuelo; polling + Realtime comparten la misma Promise.
- `mergeOperativaSafe()` — si falla Supabase al guardar pendiente, **no vacía** caché operativa.
- Hooks (`usePanel`, historial, mesas) — en error conservan estado previo y loguean en consola.
- `OPERATIVA_POLL_MS = 5000`, `SYNC_PENDING_POLL_MS = 3000`.
- Realtime — `removeChannel` en unmount; callback estable con `useRef`.

---

## Riesgos residuales aceptados (antes de Fase B)

| Riesgo | Motivo | Fase |
|--------|--------|------|
| Sin tests automatizados | Cobertura 0 | **B** |
| Historial/cierre sin polling en vivo | Solo refresco al entrar/cambiar fecha | B / D |
| Estado mesa manual no sincroniza | `mesas-estado` local | D |
| Offline básico (cola manual) | Sin IndexedDB/outbox | D |
| `mesa_estados` en Supabase sin usar desde app | Preparado para fase futura | D |

---

## Qué sigue

- **Fase B — Tests:** unitarios, repos, simulación multi-móvil.
- **Fases C–E:** optimización, offline serio, impresora TCP 9100.
