# Módulo de impresión Wi-Fi

Impresión de tickets vía **servidor local** y **una impresora principal**.

## Arquitectura

```
Móviles (PWA) → printTicket() → /api/impresion o print-server
                                        ↓
                              Impresora principal (única)
```

## Destinos lógicos (futuro multi-impresora)

Internamente se distinguen `cocina`, `barra`, `postres`, `reimpresion`.
**Físicamente todos salen por la misma impresora** configurada en `/configuracion/impresora`.

## Configuración

- App: `/configuracion/impresora` → localStorage
- Campos: nombre, IP, puerto (9100), ancho (58/80mm), activa, modo mock/network

## Modos

- **mock**: simula impresión (consola + log)
- **network**: preparado ESC/POS — pendiente implementación real

## Próximo paso

1. Modelo impresora ESC/POS confirmado
2. Implementar TCP en `drivers/escpos.ts`
3. Más adelante: soporte multi-impresora si se añaden
