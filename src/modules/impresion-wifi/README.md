# Módulo de impresión Wi-Fi

Este módulo se implementará en una fase posterior para imprimir tickets en impresoras de cocina/barra vía red local.

## Arquitectura prevista

```
Móviles (comandero PWA)
        ↓
Servidor local en el restaurante
        ↓
Impresora Wi-Fi/Ethernet (cocina / barra / postres)
```

## Tipos de ticket previstos

- **Cocina**: comanda completa con secciones (entrantes, primeros, segundos, bebidas, observaciones)
- **Barra**: bebidas y observaciones relevantes
- **Postres**: ticket separado sin copia de cocina (mesa, postres, X, C/L+H)

Los móviles no imprimirán directamente; enviarán la comanda al servidor local, que gestionará la impresión.
