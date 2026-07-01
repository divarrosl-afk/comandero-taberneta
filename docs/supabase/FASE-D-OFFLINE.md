# Fase D — Offline serio

## Objetivo

El camarero **sigue trabajando sin conexión** en modo `supabase` / `hybrid`. Al volver Internet, los cambios se sincronizan solos. El dispositivo **no pierde la cola** al cerrar la app (persistencia en IndexedDB).

---

## 1. Outbox IndexedDB

### Base de datos

- Nombre: `comandero-taberneta-sync`
- Store `outbox` — clave `opId` (UUID de operación)
- Store `snapshot` — clave fija `operativa`

### Operaciones que guarda

| `kind` | Cuándo | Payload |
|--------|--------|---------|
| `cocina_create` | Falla `guardarComanda` remoto | `ComandaCocina` completa |
| `postres_create` | Falla `guardarPostres` remoto | `ComandaPostres` completa |
| `cocina_estado` | Falla `actualizarEstadoComanda` remoto (comanda ya en servidor) | `{ estado: EstadoPanel }` |
| `postres_estado` | Falla `actualizarEstadoPostres` remoto | `{ estado: EstadoPanel }` |

### IDs y deduplicación

- **Create:** el cliente genera `comanda.id` con `crypto.randomUUID()` **antes** de guardar. Ese mismo ID viaja en outbox y a Supabase → evita duplicados al reintentar.
- **Create en cola:** `enqueueCocinaCreate` / `enqueuePostresCreate` hacen **upsert por `entityId`** (un solo op por comanda).
- **Estado sobre create pendiente:** se actualiza el payload del `*_create` (no se añade op extra).
- **Estado sobre comanda ya en servidor:** se eliminan ops `*_estado` previas del mismo `entityId` y se encola una nueva → **last-write-wins local** por dispositivo.
- **Flush idempotente:** si Supabase responde `duplicate key` / `23505`, la entrada se elimina de outbox sin error.

### Persistencia al cerrar el móvil

Sí. La cola vive en **IndexedDB**, no en RAM ni solo en `localStorage`. Al reabrir la PWA, `SyncWorkerProvider` ejecuta `migrateLegacyPendingQueue` + `hydrateOutboxMirror` + `flushOutbox`.

---

## 2. Sync automático

| Disparador | Implementación |
|------------|----------------|
| Volver online | `window.addEventListener("online", flushOutbox)` |
| Cada 30 s | `setInterval(flushOutbox, SYNC_FLUSH_MS)` |
| Enfocar app | `visibilitychange` → `visible` → `flushOutbox` |
| Tras guardar/cambiar estado | `void flushOutbox()` en services (si hay red) |

### Anti-bucles / anti-duplicados

- Flag `flushing`: llamadas concurrentes devuelven `{ ok: 0, fail: 0 }` sin reprocesar.
- Backoff exponencial por entrada (`retries`, máx. 8, base 2 s, tope 60 s).
- Entradas con `retries >= 8` se omiten (quedan en outbox; banner sigue visible).
- Tras flush exitoso de un create, se eliminan ops `*_create` y `*_estado` de esa entidad.

---

## 3. UI optimista

| Acción offline | Comportamiento |
|----------------|----------------|
| Enviar comanda | `setComandasCache` inmediato + outbox si falla remoto |
| Cambiar estado | `patchCocinaInCache` / `patchPostresInCache` + snapshot IDB + outbox |
| Panel tras sync | `loadOperativaMerged` refresca caché; merge no duplica por `id` |
| Estado pendiente en outbox | **Overlay** de `*_estado` y `*_create` sobre la vista merged (last-write-wins local por `entityId`) hasta que el flush confirme |

El overlay evita parpadeo con red intermitente: si el poll trae remoto antiguo pero hay `cocina_estado` / `postres_estado` en outbox, **prevalece el estado local pendiente**.

---

## 4. Snapshot operativo

### Cadena de lectura (`loadOperativaMerged`)

1. Intenta Supabase (`getAll` cocina + postres).
2. Si falla → snapshot IDB (`operativa`).
3. Si no hay snapshot → caché RAM (`operativa-cache`).
4. Merge con creates pendientes del outbox (`mergeOperativa`).
5. **Overlay** de estados pendientes (`*_estado` + `estadoPanel` en `*_create`) sobre la vista final.

### Quién lo usa

`fetchOperativaData` alimenta **panel, mesas, historial y cierre** (vía hooks).

### Sin snapshot ni caché

- No hay banner específico de «sin datos offline».
- El panel puede quedar **vacío** hasta que haya snapshot o red.
- El banner amarillo solo aparece si `countOutbox() > 0` (hay cambios pendientes de sync).

---

## 5. Conflictos multi-móvil

| Escenario | Criterio actual |
|-----------|-----------------|
| Dos móviles crean comandas distintas | Sin conflicto (UUID distintos). |
| Dos móviles crean la misma comanda (mismo UUID) | Improbable; si ocurre, `duplicate key` → idempotente. |
| Dos móviles cambian estado de la misma comanda offline | **Last-write-wins en servidor:** cada dispositivo hace `actualizarEstado` al flush; gana el último que llegue. No hay `updated_at` ni merge de estados en cliente. |
| Mismo `id` en remoto y create pendiente local | `mergeOperativa` **gana remoto** en el cuerpo de la comanda; el overlay aplica `estadoPanel` del outbox si hay op pendiente. |
| Estado pendiente (`*_estado`) en outbox | **Overlay en `loadOperativaMerged`** — prevalece sobre remoto/snapshot/caché hasta flush. Last-write-wins local por `entityId`. |

---

## 6. Migración `localStorage` → IndexedDB

- Claves legacy: `comandero-taberneta:sync-pending-cocina`, `...-postres`
- `migrateLegacyPendingQueue()` al arrancar el worker (solo backend remoto).
- Tras migrar, **borra** las claves de `localStorage`.
- Re-ejecutar es **idempotente** (localStorage ya vacío; creates coalescen por `entityId`).
- Test: `tests/unit/sync/outbox-migrate.test.ts`

---

## 7. Tests (77 en total)

### Nuevos / ampliados para Fase D

| Archivo | Qué cubre |
|---------|-----------|
| `tests/unit/sync/outbox.test.ts` | CRUD outbox, coalesce create, estado en create pendiente |
| `tests/unit/sync/outbox-migrate.test.ts` | Migración legacy idempotente |
| `tests/unit/sync/sync-worker.test.ts` | Flush OK, fallo conserva op, duplicate key, anti-concurrencia |
| `tests/unit/sync/retry-pending.test.ts` | Delegación en `flushOutbox` |
| `tests/integration/operativa-estado-overlay.test.ts` | Overlay remoto/snapshot + outbox, create sin duplicar, post-flush |
| `tests/unit/sync/operativa-estado-overlay.test.ts` | Overlay puro last-write-wins |
| `tests/integration/operativa-read-offline.test.ts` | Snapshot + outbox, fallback caché, no duplicar |
| `tests/integration/operativa-fetch.test.ts` | Dedup concurrente de `fetchOperativaData` |
| `tests/unit/sync/merge-operativa.test.ts` | Dedup por `id` (gana remoto) |

### Setup

- `fake-indexeddb` en `vitest.setup.ts`
- Tests de sync remoto: `vi.stubEnv("NEXT_PUBLIC_DATA_BACKEND", "supabase")`
- **No** importar `sync-worker-client` en setup global (rompe mocks de Vitest)

---

## 8. Modo local (`DATA_BACKEND=local`)

- `usesRemoteData()` → `false`
- Sin outbox operativo, sin `SyncWorkerProvider` efectivo, sin snapshot obligatorio.
- `guardarComanda` / `guardarPostres` usan repos locales → **`localStorage` intacto** (`comandero-taberneta:comandas`, etc.).
- Test de regresión: `tests/integration/flujo-operativo.test.ts`

---

## 9. Verificación CI

```bash
npm run test   # 76 passed
npm run lint   # OK
npm run build  # OK
```

---

## 10. Cómo probar offline en móvil

1. Desplegar o abrir la PWA con `NEXT_PUBLIC_DATA_BACKEND=supabase` y credenciales configuradas.
2. Iniciar sesión y cargar panel (genera snapshot).
3. Activar **modo avión** o cortar WiFi.
4. Crear comanda → debe aparecer en panel al instante.
5. Cambiar estado → debe reflejarse al momento.
6. Cerrar pestaña / matar app y reabrir en avión → datos deben persistir (snapshot + outbox).
7. Quitar modo avión → en ~30 s o al enfocar, banner debe desaparecer y datos en Supabase.
8. Opcional: banner «Reintentar ahora» para forzar flush.

---

## Riesgos residuales (MVP)

| Riesgo | Severidad | Notas |
|--------|-----------|-------|
| Sin aviso si no hay snapshot ni red (primera visita offline) | Baja | Panel vacío; sin mensaje dedicado |
| Multi-móvil estado: last-write-wins en servidor sin CRDT | Media | Aceptado en MVP; overlay solo en este dispositivo |
| `mesas-estado` manual no sincroniza | Baja | Fuera de MVP |
| Borrado / cierre offline | Media | Fuera de MVP |
| Backoff usa `createdAt` no timestamp del último retry | Baja | Puede espaciar menos de lo esperado |
| iOS: sin Background Sync API | Baja | Dependemos de online / intervalo / visibility |
| Snapshot vacío en IDB bloquea fallback a caché RAM | Baja | Solo si `snap !== null` con arrays vacíos |

### R1 — corregido

**Parpadeo de estado con red intermitente:** resuelto con overlay de `*_estado` y `estadoPanel` en `*_create` en `loadOperativaMerged` (`buildEstadoOverlayFromOutbox` + `applyEstadoOverlay`). Tests: `operativa-estado-overlay.test.ts`.

---

## Plan futuro

1. Banner «modo offline sin datos» si remoto + snapshot + caché vacíos.
2. Sincronizar `mesas-estado` manual.
3. Borrado y cierre offline con cola.
4. Background Sync API donde el SO lo permita.
5. Resolución de conflictos con `updated_at` o versioning en Supabase.

---

## Archivos clave

- `src/lib/sync/outbox.ts` — cola IndexedDB
- `src/lib/sync/sync-worker.ts` — procesador con backoff
- `src/lib/sync/sync-worker-client.ts` — disparadores automáticos
- `src/lib/sync/operativa-read.ts` — lectura merged
- `src/lib/sync/operativa-snapshot.ts` — snapshot IDB
- `src/components/providers/SyncWorkerProvider.tsx` — arranque en layout
