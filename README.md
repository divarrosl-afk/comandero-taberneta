# Comandero Taberneta

Comandero web/PWA para **La Taberneta de Ca la Ingrid**. Aplicación pensada para móviles y tablets de los camareros, usable desde el navegador y guardable en pantalla de inicio.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **PWA** (instalable en móvil/tablet)
- **Supabase** — Auth y configuración compartida (Fase 1); comandas aún en localStorage
- Módulos futuros: impresión Wi-Fi e integración Ágora TPV

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Instalación

```bash
git clone <url-del-repositorio>
cd comandero-taberneta
npm install
```

Copia las variables de entorno de ejemplo:

```bash
cp .env.example .env.local
```

Por defecto la app usa **modo local** (`NEXT_PUBLIC_DATA_BACKEND=local`) y no requiere Supabase.

## Modos de datos

| Modo | Variable | Descripción |
|------|----------|-------------|
| **Local** (default) | `NEXT_PUBLIC_DATA_BACKEND=local` | Todo en `localStorage` — comportamiento clásico |
| **Supabase** | `NEXT_PUBLIC_DATA_BACKEND=supabase` | Auth, carta, menú, mesas e impresora (metadata) en Supabase |
| **Híbrido** | `NEXT_PUBLIC_DATA_BACKEND=hybrid` | Igual que Supabase en Fase 1 (comandas/postres siguen locales) |

### Modo local

No necesitas configurar Supabase. Usuarios de demo en `src/data/usuarios.ts` (solo desarrollo).

| Usuario  | Contraseña | Rol      |
|----------|------------|----------|
| `divarro` | `admin`    | ADMIN    |
| `david`   | `camarero` | CAMARERO |
| `ingrid`  | `camarero` | CAMARERO |
| `cocina`  | `camarero` | CAMARERO |

> Estas contraseñas son **solo para modo local**. En Supabase se gestionan con Auth (ver seed).

### Modo Supabase

En `.env.local`:

```env
NEXT_PUBLIC_DATA_BACKEND=supabase
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_RESTAURANTE_ID=b1c2d3e4-f5a6-4789-a012-3456789abcde
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # solo servidor — nunca NEXT_PUBLIC_
```

1. Ejecuta `supabase/schema.sql` en el SQL Editor de Supabase.
2. Crea usuarios iniciales (ver seed abajo).
3. Login con username (`divarro`) — internamente usa `divarro@taberneta.local`.

**Importante (Fase 1–2):** con `supabase`/`hybrid`, carta, menú, mesas, **comandas y postres** se sincronizan entre dispositivos. Si falla la red al enviar, la comanda se guarda localmente con aviso.

Si faltan variables con `supabase`/`hybrid`, la app muestra un error claro en lugar de pantalla rota.

### Seed inicial Supabase

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://..."
export SUPABASE_SERVICE_ROLE_KEY="eyJ..."
export NEXT_PUBLIC_RESTAURANTE_ID="b1c2d3e4-f5a6-4789-a012-3456789abcde"
export SEED_ADMIN_PASSWORD="tu-password-seguro"
export SEED_CAMARERO_PASSWORD="otra-password"

npm run seed:supabase
```

Documentación completa: [`docs/supabase/SEED.md`](docs/supabase/SEED.md).

### Volver a modo local

```env
NEXT_PUBLIC_DATA_BACKEND=local
```

Reinicia `npm run dev`. La app vuelve a `localStorage` sin errores.

> Supabase puede dejarse vacío en modo local.

## Ejecución en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

Para probar en móvil en la misma red Wi-Fi, usa la IP local del servidor:

```txt
http://<ip-del-servidor>:3000
```

## Producción

```bash
npm run build
npm start
```

## Despliegue en Vercel

**URL de producción:** https://comandero-taberneta-divarro.vercel.app  
**Alias:** https://comandero-taberneta.vercel.app (asignado vía `vercel.json`)

### Variables de entorno

| Variable     | Valor  |
|-------------|--------|
| `PRINT_MODE` | `mock` |

Definida en `vercel.json` y en el dashboard de Vercel (Production).

### Acceso público (obligatorio para móviles)

Si la URL pide login de Vercel, desactiva **Deployment Protection → Vercel Authentication** en Production:

1. [Settings → Deployment Protection](https://vercel.com/divarro/comandero-taberneta/settings/deployment-protection)
2. Desactiva protección en **Production**
3. Redeploy

O ejecuta (una vez, con token de https://vercel.com/account/tokens):

```bash
VERCEL_TOKEN=xxx node scripts/configure-vercel-production.mjs
```

### Credenciales de la app (modo local)

Ver tabla en [Modo local](#modo-local). En Vercel sin Supabase configurado, el modo por defecto es local.

> La impresora física no imprimirá en Vercel (`PRINT_MODE=mock`). En el restaurante se usará el print-server en red local.

## PWA — Instalar en el móvil

1. Abre la URL del comandero en Chrome/Safari.
2. En **Android (Chrome)**: menú → *Añadir a pantalla de inicio*.
3. En **iOS (Safari)**: compartir → *Añadir a pantalla de inicio*.

La app se abrirá a pantalla completa, como una aplicación nativa.

## Estructura del proyecto

```txt
comandero-taberneta/
├── public/
│   ├── manifest.json          # Manifiesto PWA
│   └── icons/                 # Iconos de la app
├── src/
│   ├── app/                   # Rutas Next.js (App Router)
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Pantalla principal
│   │   ├── offline/           # Página sin conexión (PWA)
│   │   └── globals.css
│   ├── types/
│   │   └── comanda.ts         # Modelo de datos de comandas
│   ├── lib/
│   │   ├── data/              # Selector backend local/supabase
│   │   ├── supabase/          # Cliente, mappers, admin (servidor)
│   │   └── auth/              # Repositorios Auth + usuarios
│   └── modules/
│       ├── integracion-agora/ # Módulo futuro Ágora TPV
│       └── impresion-wifi/    # Módulo futuro impresión
├── .env.example
├── next.config.ts             # Config Next.js + PWA
├── package.json
└── tsconfig.json
```

## Fases de desarrollo

### Fase 0 — Esquema Supabase

- SQL, RLS, documentación (`docs/supabase/`)

### Fase 1 (actual) — Auth + configuración compartida

- Supabase Auth + perfiles/roles
- Carta, menú del día, mesas, metadata impresora compartidos
- Comandas/postres **siguen en localStorage** (Fase 2 = sync entre móviles)

### Fase 2 (actual) — Comandas sincronizadas

- Comandas cocina y postres en Supabase
- Panel, historial, cierre y estado de mesas compartidos
- Realtime + polling 5s; copia local de emergencia si falla Supabase

### Fase 3 — Servidor local e impresión

- Servidor en el restaurante (mini PC)
- Impresión Wi-Fi de tickets cocina/barra/postres

### Fase 4 — Integración Ágora TPV

- Módulo `integracion-agora` independiente

## Modelo de comanda (referencia)

### Comanda cocina/barra

```txt
MESA 4 · CAMARERO DAVID

ENTRANTES
- Croquetas jamón x4

PRIMEROS
- Gazpacho · MENÚ
- Burrata · MENÚ + SUPLEMENTO +5€
- Macarrones · CARTA · SALE COMO PRIMERO

SEGUNDOS
- Bistec · MENÚ · poco hecho
- Hamburguesa Angus · CARTA · SALE COMO SEGUNDO

BEBIDAS
- 2 aguas
- 1 copa vino

OBSERVACIONES
- Primero sacar entrantes
- Marchar segundos después
```

### Comanda postres (separada)

```txt
MESA 4

POSTRES
- Tarta queso
- Mousse limón

---------
X
C/L + H
```

## Scripts disponibles

| Comando        | Descripción                    |
|----------------|--------------------------------|
| `npm run dev`  | Servidor de desarrollo         |
| `npm run build`| Compilar para producción       |
| `npm start`    | Servidor de producción         |
| `npm run lint` | Revisar código con ESLint      |
| `npm run seed:supabase` | Seed usuarios en Supabase (requiere env) |

## Licencia

Proyecto privado — La Taberneta de Ca la Ingrid.
