# Fase E — Impresión real (print-server + TCP 9100)

## Por qué no imprime el móvil directamente

Safari, Chrome y las PWA **no pueden abrir sockets TCP** al puerto 9100. No es un fallo de la impresora ni de Comandero: es una limitación del navegador.

## Arquitectura profesional

```
Móviles (PWA)  ──HTTP──►  Portátil restaurante (print-server :3100)
                                │
                                ├── Cola de impresión (persistente)
                                ├── Reintentos automáticos
                                └── TCP 9100 ──► Impresora ESC/POS
```

- **Vercel / nube:** no alcanza IPs privadas (`192.168.x.x`).
- **Print-server:** se instala **una vez** en el portátil del restaurante.
- **Sin Internet:** sigue imprimiendo dentro de la LAN.

## Qué incluye

| Capacidad | Implementación |
|-----------|----------------|
| Detectar impresora | `POST /test-connection` (TCP al IP:puerto) |
| Probar conexión | Botón en `/configuracion/impresora` |
| Ticket ESC/POS real | `print-server/lib/escpos.js` → TCP 9100 |
| Reimpresión | `reimprimirTicket` (historial) |
| Cola | `print-server/lib/queue.js` + `data/queue.json` |
| Reintento si apagada | Backoff exponencial, máx. 8 intentos |
| Estados UI | En cola · Imprimiendo · Impreso · Error |

## Endpoints print-server

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servicio y cola |
| POST | `/print` | Encola ticket → `202` + `jobId` |
| GET | `/jobs/:id` | Estado del trabajo |
| GET | `/jobs` | Últimos trabajos |
| POST | `/test-connection` | Prueba TCP sin imprimir |

## Configuración

### Portátil (servidor)

```bash
cd print-server
cp .env.example .env
# Editar PRINTER_IP, PORT=3100
npm run start   # desde la raíz del monorepo
```

**Windows (servicio permanente):**

```powershell
cd print-server
powershell -ExecutionPolicy Bypass -File windows/install-service.ps1
```

### PWA (móviles)

```env
NEXT_PUBLIC_PRINT_SERVER_URL=http://192.168.1.50:3100
```

En `/configuracion/impresora`:
- Modo **Red (network)**
- IP y puerto de la impresora
- **Probar conexión TCP** → luego **Probar impresión**

## Flujo de un ticket

1. Camarero envía comanda → `printTicket()` POST al print-server.
2. Servidor encola trabajo (`status: queued`).
3. Worker imprime por TCP (`status: printing`).
4. Éxito → `printed` · Fallo → reintento automático.
5. La PWA hace polling de `/jobs/:id` hasta **Impreso** o **Error**.

## Seguridad

- Opcional: `PRINT_API_KEY` + header `X-Print-Key`.
- El servidor debe estar solo en la **WiFi del restaurante**.

## Qué NO hace (futuro)

- Varias impresoras físicas por destino (cocina/barra/postres separadas).
- Cola de impresión offline en el móvil si el portátil no responde.
- Dashboard web de trabajos.

## Tests

- `tests/unit/print/escpos-encode.test.ts`
- `tests/unit/print/print-status.test.ts`

## Verificación local

```bash
npm run print-server:dev
# En otra terminal:
curl http://localhost:3100/health
```
