"use client";

import { useCallback, useEffect, useState } from "react";
import {
  crearProductoVacio,
  getCatalogo,
  getProductosPorSeccion,
  guardarCatalogo,
  resetCatalogo,
} from "@/lib/storage/catalogo";
import type { ProductoCatalogo, SeccionCatalogo } from "@/types/catalogo";

export function useCatalogo() {
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);

  const recargar = useCallback(() => {
    setProductos(getCatalogo());
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const guardar = useCallback(
    (lista: ProductoCatalogo[]) => {
      guardarCatalogo(lista);
      recargar();
    },
    [recargar],
  );

  const agregar = useCallback(
    (producto: ProductoCatalogo) => {
      guardar([...getCatalogo(), producto]);
    },
    [guardar],
  );

  const actualizar = useCallback(
    (id: string, cambios: Partial<ProductoCatalogo>) => {
      const lista = getCatalogo().map((p) =>
        p.id === id ? { ...p, ...cambios, nombre: cambios.nombre?.trim() ?? p.nombre } : p,
      );
      guardar(lista);
    },
    [guardar],
  );

  const eliminar = useCallback(
    (id: string) => {
      guardar(getCatalogo().filter((p) => p.id !== id));
    },
    [guardar],
  );

  const restaurarDefault = useCallback(() => {
    setProductos(resetCatalogo());
  }, []);

  const porSeccion = useCallback(
    (seccion: SeccionCatalogo, soloFavoritos = false) =>
      getProductosPorSeccion(seccion, {
        soloActivos: true,
        soloFavoritos,
      }),
    [],
  );

  return {
    productos,
    recargar,
    guardar,
    agregar,
    actualizar,
    eliminar,
    restaurarDefault,
    porSeccion,
    crearProductoVacio,
  };
}
