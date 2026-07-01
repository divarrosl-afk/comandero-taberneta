# Despliegue en producción — Comandero Taberneta v1.0

Arquitectura objetivo:

```
Móviles (HTTPS)  →  Vercel (Comandero PWA)
                         │
                         ▼
                   Supabase (print_jobs)
                         │
                         ▼
Lenovo (print-server)  →  TCP 9100  →  Impresora APPPOS
```

El Lenovo **no sirve la app** a los camareros. Solo imprime dentro de la LAN del restaurante.

---

## 1. Desplegar en Vercel

### Variables de entorno en Vercel

| Variable | Obligatoria |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí (cola impresión) |
| `NEXT_PUBLIC_DATA_BACKEND` | `supabase` |
| `NEXT_PUBLIC_RESTAURANTE_ID` | Sí |

> No use `NEXT_PUBLIC_PRINT_SERVER_URL` con `http://192.168.x.x` — mixed-content bloqueado desde HTTPS.

### Despliegue

Push a `main` despliega automáticamente en Vercel, o `npx vercel --prod`.

---

## 2. Configurar el Lenovo

```bash
cp print-server/.env.example print-server/.env
# Editar PRINTER_IP, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_RESTAURANTE_ID
npm run print-server
```

---

## 3. Móviles

Abrir `https://comandero-taberneta.vercel.app`, login, añadir a pantalla de inicio.

---

## 4. Cambiar IP impresora

Editar `PRINTER_IP` en `print-server/.env` y en Configuración → Impresora en la app.

---

## 5. Comprobador

Configuración → Impresora → **Comprobar print-server**.
