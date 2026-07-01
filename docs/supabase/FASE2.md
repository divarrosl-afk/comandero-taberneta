# Fase 2 — Comandas y postres sincronizados

## Qué cambia

Con `NEXT_PUBLIC_DATA_BACKEND=supabase` o `hybrid`:

- Comandas cocina → tabla `comandas_cocina`
- Postres → tabla `comandas_postres`
- Panel, historial, cierre y estado de mesas leen datos compartidos
- Realtime Supabase + polling cada 5 s como respaldo

Con `NEXT_PUBLIC_DATA_BACKEND=local`: sin cambios (localStorage).

## SQL adicional

Si ya aplicaste el esquema de Fase 1, ejecuta:

```sql
-- supabase/migrations/20250701_realtime_comandas.sql
ALTER PUBLICATION supabase_realtime ADD TABLE comandas_cocina;
ALTER PUBLICATION supabase_realtime ADD TABLE comandas_postres;
```

## Probar con dos móviles

1. Mismo `.env` Supabase en ambos (o misma build Vercel).
2. Login con usuarios distintos (p. ej. `david` y `ingrid`).
3. Móvil A: envía comanda mesa C1.
4. Móvil B: abre **Panel** — debe aparecer en ~5 s o al instante con Realtime.
5. Cambia estado en panel (B) → A ve el cambio al recargar panel.
6. **Mesas**: móvil B debe ver la mesa pendiente/ocupada.

## Si falla Supabase al enviar

- La comanda se guarda en localStorage del dispositivo.
- Banner ámbar: «No se ha podido sincronizar…»
- Pantalla de envío muestra el mismo aviso.
- No se pierde la comanda.

## Seguridad (RLS)

- CAMARERO: crear comandas/postres, actualizar `estado_panel`
- CAMARERO: no puede borrar (soft-delete) — solo ADMIN
- Historial: borrar solo si `puedeBorrarHistorial` (ADMIN)
