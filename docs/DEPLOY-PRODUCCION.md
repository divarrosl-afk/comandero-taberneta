# Despliegue en producción — Comandero Taberneta v1.0

## Flujo cloud (Vercel)

```
Móvil (HTTPS)  →  Vercel /api/impresion  →  Supabase print_jobs
                                                    │
                                                    ▼
                              Lenovo print-server (cloud-poller cada 3s)
                                                    │
                                                    ▼
                                            Impresora TCP 9100
```

---

## Checklist antes de probar desde Vercel

### 1. Supabase — migración `print_jobs`

Ejecutar en SQL Editor el contenido de:

`supabase/migrations/20250704_print_jobs.sql`

Comprobar:

```sql
SELECT count(*) FROM print_jobs;
```

### 2. Vercel — variables de entorno

| Variable | Obligatoria |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí — **sin esto no se encolan tickets** |
| `NEXT_PUBLIC_DATA_BACKEND` | `supabase` |
| `NEXT_PUBLIC_RESTAURANTE_ID` | Sí — UUID del restaurante |

Redeploy tras cambiar variables.

### 3. Lenovo — `print-server/.env`

```env
PORT=3100
PRINTER_IP=192.168.1.100
PRINTER_PORT=9100
PRINT_MODE=network

NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_RESTAURANTE_ID=mismo-uuid-que-NEXT_PUBLIC_RESTAURANTE_ID
CLOUD_POLL_MS=3000
```

Arrancar:

```bash
npm run print-server
```

Debe mostrar:

```
[cloud-poller] ACTIVO · cada 3000ms
```

Si muestra `INACTIVO — faltan variables`, revisar el `.env`.

### 4. Diagnóstico

**Vercel (API):**

```
GET https://comandero-taberneta.vercel.app/api/print-jobs/health
```

Debe indicar `printJobs.tableExists: true` y `serviceRoleConfigured: true`.

**Lenovo:**

```bash
curl http://localhost:3100/health
```

Debe incluir `"cloudPolling": true`.

---

## Qué falta si no imprime desde Vercel

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `cloudPolling: false` en Lenovo | Falta `.env` Supabase | Añadir las 3 variables y reiniciar |
| `tableExists: false` en Vercel | Migración no aplicada | Ejecutar `20250704_print_jobs.sql` |
| Error al encolar en móvil | Sin `SUPABASE_SERVICE_ROLE_KEY` en Vercel | Añadir en dashboard Vercel + redeploy |
| Jobs en Supabase pero no imprimen | Lenovo apagado o poller inactivo | `npm run print-server` + logs `[cloud-poller]` |
| Poller activo, error TCP | IP impresora incorrecta | `PRINTER_IP` en `.env` |

---

## Local vs Vercel

| Entorno | Flujo |
|---------|-------|
| `http://192.168.x.x:3000` | Directo o print-server LAN |
| `https://*.vercel.app` | Siempre cola Supabase → cloud-poller |

No configure `NEXT_PUBLIC_PRINT_SERVER_URL=http://192.168.x.x` en Vercel (mixed-content bloqueado).
