# Módulo de impresión Wi-Fi

Impresión de tickets vía **servidor local**. Los móviles nunca imprimen directamente.

## Arquitectura

```
Móviles (PWA comandero)
        ↓  printTicket()
API interna (/api/impresion)  o  PRINT_SERVER_URL
        ↓
Servidor local (print-server/)
        ↓
Impresora ESC/POS Wi-Fi/Ethernet (futuro)
```

## Destinos

| Destino | Ticket |
|---------|--------|
| `cocina` | Entrantes, primeros, segundos, extras, observaciones |
| `barra` | Bebidas, extras de barra, observaciones |
| `postres` | Ticket postres separado (sin copia cocina) |
| `reimpresion` | Desde historial |

## Modos

- **mock** (`PRINT_MODE=mock`): registra ticket en consola y `print-server/logs/tickets.log`
- **network** (`PRINT_MODE=network`): preparado para ESC/POS — pendiente modelo/IP impresora

## Uso en código

```typescript
import { imprimirComandaCocina, printTicket } from "@/modules/impresion-wifi";

await imprimirComandaCocina(comanda); // cocina + barra si hay bebidas
await printTicket(texto, "postres", { tipo: "postres", mesa: 4 });
```

## Servidor local

```bash
cd print-server
cp .env.example .env
npm start
```

## Variables (.env)

Ver `.env.example` en la raíz del proyecto.

## Próximo paso (impresión física)

1. Confirmar modelo impresora (80mm ESC/POS, Wi-Fi o Ethernet)
2. IP fija de cada impresora
3. Implementar driver TCP puerto 9100 en `drivers/escpos.ts`
