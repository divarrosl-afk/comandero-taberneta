# Lenovo — impresora activa (cloud-poller)

Guía para que el **Lenovo del restaurante** imprima comandas enviadas desde Vercel.

## Flujo

```
Móvil (Vercel) → Supabase print_jobs → Lenovo (print-server) → impresora 192.168.x.x:9100
```

Vercel **no** habla con la impresora directamente. El Lenovo debe estar encendido con `print-server` corriendo.

---

## 1. Instalar en el Lenovo

```bash
git clone https://github.com/divarrosl-afk/comandero-taberneta.git
cd comandero-taberneta
npm ci
cp print-server/.env.example print-server/.env
```

## 2. Editar `print-server/.env`

```env
PORT=3100
PRINT_SERVER_HOST=0.0.0.0

# IP de la impresora térmica en la WiFi del restaurante
PRINTER_IP=192.168.4.100
PRINTER_PORT=9100
PRINT_MODE=network

# Mismos valores que en Vercel / GitHub Secrets
NEXT_PUBLIC_SUPABASE_URL=https://vhlzbfrzmqljngwegbde.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Supabase → Settings → API → service_role
SUPABASE_RESTAURANTE_ID=b1c2d3e4-f5a6-4789-a012-3456789abcde
CLOUD_POLL_MS=3000
```

La **service_role key** está en Supabase → Project Settings → API (sección secret).

## 3. Arrancar el servidor

```bash
npm run print-server
```

Debes ver en consola:

```
[cloud-poller] ACTIVO · cada 3000ms
[cloud-poller] Restaurante b1c2d3e4-...
```

Si ves `INACTIVO — faltan variables`, revisa las 3 variables de Supabase en `.env`.

## 4. Comprobar

```bash
curl http://localhost:3100/health
```

`"cloudPolling": true` → listo.

Prueba impresión local:

```bash
curl -X POST http://localhost:3100/test-print
```

## 5. Dejarlo siempre encendido

- Deja el Lenovo **encendido** durante el servicio.
- Opcional Windows: `print-server/windows/install-service.ps1` (servicio al arrancar).

---

## Windows (CMD) — paso a paso

En **Windows no** se ponen variables con `VAR=valor` en CMD. Van en el archivo **`print-server\.env`** editado con Notepad.

### 1. Actualizar código

```cmd
cd %USERPROFILE%\Documents\comandero-taberneta
git checkout main
git pull origin main
```

### 2. Crear / editar `.env`

```cmd
copy print-server\.env.example print-server\.env
notepad print-server\.env
```

Pega la **service_role key** real de Supabase (empieza por `eyJ...`). Guarda el archivo.

Comprobar:

```cmd
print-server\windows\check-env.bat
```

### 3. Liberar puerto 3100 (si sale EADDRINUSE)

```cmd
print-server\windows\stop-print-server.bat
```

### 4. Arrancar

```cmd
npm run print-server
```

Debes ver:

```
[cloud-poller] ACTIVO · cada 3000ms
   Cloud:   ACTIVO · poll 3000ms
```

O usa el script:

```cmd
print-server\windows\start-print-server.bat
```

### 5. Comprobar

```cmd
curl http://localhost:3100/health
```

Busca `"cloudPolling":true`. Si falta, `missingCloudEnv` te dice qué línea falta en `.env`.

---

## Si no imprime desde el móvil

| Comprobación | Cómo |
|--------------|------|
| Vercel encola tickets | https://comandero-taberneta.vercel.app/api/print-jobs/health → `ok: true` |
| Lenovo activo | `curl localhost:3100/health` → `cloudPolling: true` |
| Misma WiFi | Lenovo e impresora en la misma red que `PRINTER_IP` |
| Jobs en cola | Supabase → Table Editor → `print_jobs` → filas `queued` |
| IP impresora | `ping 192.168.4.100` desde el Lenovo |

Tras enviar comanda desde el móvil, en ~3–6 s debería imprimir si todo está activo.
