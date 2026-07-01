# Fase D — Offline serio

## Objetivo

El camarero **sigue trabajando sin conexión**. Al volver Internet, los cambios se sincronizan solos.

## Qué incluye (MVP)

| Capacidad | Implementación |
|-----------|----------------|
| Cola persistente | IndexedDB `comandero-taberneta-sync` → store `outbox` |
| Snapshot operativa | IndexedDB store `snapshot` (última vista merged) |
| Crear comanda/postres offline | `cocina_create` / `postres_create` |
| Cambiar estado offline | `cocina_estado` / `postres_estado` |
| Reintento automático | `flushOutbox` al volver `online`, cada 30 s, al enfocar app |
| UI optimista | Caché RAM + patch inmediato en panel |
| Migración legacy | `localStorage sync-pending-*` → outbox al arrancar |
| Banner | Pendientes + «Reintentar ahora» |

## Qué NO incluye (fases futuras)

- Sincronización de estado manual de mesas (`mesas-estado`)
- Borrado/anular offline en historial
- Cierre del día offline
- Conflictos multi-dispositivo avanzados
- Background Sync API del Service Worker (iOS limitado)

## Arquitectura

```
UI → comandas-service / postres-service
       ├─ patch caché (optimista)
       ├─ intento Supabase
       └─ outbox IndexedDB si falla
SyncWorkerProvider → flushOutbox (online / intervalo / visibility)
loadOperativaMerged → remoto | snapshot | outbox merge
```

## Archivos clave

- `src/lib/sync/outbox.ts` — cola
- `src/lib/sync/sync-worker.ts` — procesador
- `src/lib/sync/operativa-read.ts` — lectura offline
- `src/lib/sync/operativa-snapshot.ts` — persistencia IDB
- `src/components/providers/SyncWorkerProvider.tsx`

## Modo local

Sin cambios — `NEXT_PUBLIC_DATA_BACKEND=local` no usa outbox ni IndexedDB operativa.

## Tests

`tests/unit/sync/outbox.test.ts`, `sync-worker.test.ts`, `integration/operativa-read-offline.test.ts`
