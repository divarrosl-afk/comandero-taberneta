# Impresión Wi-Fi — Comandero Taberneta

## Arquitectura

```
PWA (móvil) → printTicket() → print-server (portátil) → TCP 9100 → impresora
```

Los navegadores **no pueden** abrir TCP 9100. La impresión real pasa siempre por el print-server en la LAN.

## Configuración

- `NEXT_PUBLIC_PRINT_SERVER_URL` — URL del portátil (ej. `http://192.168.1.50:3100`)
- Impresora: `/configuracion/impresora` → modo **network**, IP, puerto 9100

## Arranque print-server

```bash
npm run print-server:dev
```

Documentación completa: [`docs/supabase/FASE-E-IMPRESION.md`](../../docs/supabase/FASE-E-IMPRESION.md)
