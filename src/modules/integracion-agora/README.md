# Módulo de integración con Ágora TPV

Este módulo se implementará en una fase posterior, cuando el proveedor facilite:

- Documentación API Web JSON de Ágora
- Token o clave API
- URL/IP fija del servidor
- Puerto necesario
- Versión mínima requerida
- Ejemplos de pedidos, productos y mesas

## Arquitectura prevista

```
Comandero (comanda interna)
        ↓
Supabase (persistencia)
        ↓
integracion-agora (transformación de formato)
        ↓
Ágora TPV (API Web JSON)
```

La comanda interna se guardará siempre en Supabase. Este módulo solo transformará y enviará a Ágora cuando esté configurado, sin acoplar la app principal al TPV.
