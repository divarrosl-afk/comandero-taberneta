# Comandero Taberneta

Comandero web/PWA para **La Taberneta de Ca la Ingrid**. Aplicación pensada para móviles y tablets de los camareros, usable desde el navegador y guardable en pantalla de inicio.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **PWA** (instalable en móvil/tablet)
- **Supabase** preparado (sin conectar todavía)
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

> Supabase no está conectado todavía. Las variables pueden dejarse vacías en esta fase.

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
│   │   └── supabase/
│   │       └── client.ts      # Cliente Supabase (preparado)
│   └── modules/
│       ├── integracion-agora/ # Módulo futuro Ágora TPV
│       └── impresion-wifi/    # Módulo futuro impresión
├── .env.example
├── next.config.ts             # Config Next.js + PWA
├── package.json
└── tsconfig.json
```

## Fases de desarrollo

### Fase 1 (actual) — Comandero propio sin Ágora

- Base del proyecto y PWA
- Modelo de datos de comandas (cocina y postres)
- Pantallas: login, mesas, crear comanda, revisar, enviar, panel cocina, historial
- Persistencia en Supabase

### Fase 2 — Servidor local e impresión

- Servidor en el restaurante (mini PC)
- Impresión Wi-Fi de tickets cocina/barra/postres
- Funcionamiento en red local sin depender de internet

### Fase 3 — Integración Ágora TPV

- Módulo `integracion-agora` independiente
- Transformación de comanda interna → formato API Web JSON de Ágora
- Requiere licencia, token y documentación del proveedor

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

## Licencia

Proyecto privado — La Taberneta de Ca la Ingrid.
