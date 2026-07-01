# Fase 2 — Comandas y postres sincronizados

## Qué cambia

Con `NEXT_PUBLIC_DATA_BACKEND=supabase` o `hybrid`:

| Dato | Fuente |
|------|--------|
| Comandas cocina | `comandas_cocina` (JSONB) |
| Postres | `comandas_postres` (JSONB) |
| Panel / historial / cierre | Caché + Supabase |
| Estado de mesas | Calculado desde comandas compartidas |

Con `NEXT_PUBLIC_DATA_BACKEND=local`: sin cambios (`localStorage`).

## Activar Realtime

En el SQL Editor de Supabase (una vez por proyecto):

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE comandas_cocina;
ALTER PUBLICATION supabase_realtime ADD TABLE comandas_postres;
```

Archivo: `supabase/migrations/20250701_realtime_comandas.sql`

Si Realtime no está habilitado, el panel sigue actualizándose por **polling cada 5 s**.

## Probar con dos móviles

### Preparación

1. Misma configuración Supabase en ambos (`.env.local` o build Vercel).
2. Ejecutar `schema.sql` + migración Realtime.
3. Seed de usuarios (`npm run seed:supabase`).
4. Login: móvil A `david`, móvil B `ingrid` (o cualquier par).

### Flujo cocina

1. **Móvil A:** Nueva comanda → mesa C1 → enviar.
2. **Móvil B:** Abrir **Panel** → debe aparecer en &lt;5 s (o al instante con Realtime).
3. **Móvil B:** Cambiar estado a «En preparación».
4. **Móvil A:** Abrir Panel → debe ver el mismo estado.

### Flujo postres

1. **Móvil A:** Postres → mesa C1 → enviar.
2. **Móvil B:** Panel pestaña postres → debe aparecer.

### Historial y cierre

1. Ambos móviles: **Historial** → mismas entradas del día.
2. **Cierre** (admin): exportación con mismos totales en ambos.

### Mesas

1. Tras enviar comanda en A, **Móvil B** mapa de mesas → mesa C1 en estado pendiente/ocupada.
2. Marcar «Cobrando» / «Liberar» sigue siendo manual por dispositivo (estado local `mesas-estado`); no borra comandas en Supabase.

## Emergencia local (fallo Supabase)

Si falla la red al **enviar**:

1. La comanda se guarda en cola `sync-pending-*` (no en la clave principal de comandas).
2. Banner ámbar: «No se ha podido sincronizar…»
3. Pantalla de envío muestra el mismo aviso.
4. La comanda **no se pierde** y sigue visible en panel/historial de ese dispositivo.
5. Botón **Reintentar sincronización** en el banner — usa el mismo `id` (sin duplicar).
6. Tras éxito en Supabase, la pendiente se elimina automáticamente.

**No reenvíes** la misma comanda manualmente si ya está pendiente — usa «Reintentar sincronización».

## Seguridad (RLS)

| Rol | Permisos |
|-----|----------|
| CAMARERO | SELECT, INSERT, UPDATE `estado_panel` |
| CAMARERO | No DELETE (soft-delete) |
| ADMIN | DELETE (anular en historial) |
| UI historial | Botón borrar solo si `puedeBorrarHistorial` (ADMIN) |

## Limitaciones actuales (Fase 2)

- Sin IndexedDB ni cola offline avanzada.
- Estado manual de mesa (cobrando/libre) no se sincroniza entre móviles.
- Reintento automático en background: no — solo manual desde banner.
- Cierre exportado a JSON sigue siendo snapshot local del momento.

## Qué queda para Fase 3

- Cierre persistido en tabla `cierres` (nube).
- Cola offline con reintento automático.
- Sincronización de estado manual de mesas (`mesa_estados`).
- Posible consolidación de pendientes al recuperar conexión.
