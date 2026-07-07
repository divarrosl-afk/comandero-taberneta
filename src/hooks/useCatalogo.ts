"use client";

import { useCallback, useEffect, useState } from "react";
import {
  crearProductoVacio,
  eliminarProductoCatalogo,
  getCatalogo,
  getProductoPorId,
  getProductosPorSeccion,
  guardarCatalogo,
  resetCatalogo,
} from "@/lib/catalogo/catalogo-service";
import { usesRemoteData } from "@/lib/data/backend";
import type { ProductoCatalogo, SeccionCatalogo } from "@/types/catalogo";

async function ensureCatalogoRemoto() {
  if (!usesRemoteData()) return;
  try {
    await fetch("/api/catalogo/ensure", { cache: "no-store" });
  } catch {
    /* reintento en recargar */
  }
}

export function useCatalogo() {
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);

  const refrescarLista = useCallback(async () => {
    const lista = await getCatalogo();
    setProductos(lista);
  }, []);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      if (usesRemoteData()) {
        await ensureCatalogoRemoto();
      }
      await refrescarLista();
    } finally {
      setCargando(false);
    }
  }, [refrescarLista]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const guardar = useCallback(
    async (lista: ProductoCatalogo[]) => {
      await guardarCatalogo(lista);
      await refrescarLista();
    },
    [refrescarLista],
  );

  const agregar = useCallback(
    async (producto: ProductoCatalogo) => {
      const lista = await getCatalogo();
      await guardar([...lista, producto]);
    },
    [guardar],
  );

  const actualizar = useCallback(
    async (id: string, cambios: Partial<ProductoCatalogo>) => {
      const lista = await getCatalogo();
      const actualizada = lista.map((p) =>
        p.id === id
          ? {
              ...p,
              ...cambios,
              nombre: cambios.nombre?.trim() ?? p.nombre,
            }
          : p,
      );
      await guardar(actualizada);
    },
    [guardar],
  );

  const eliminar = useCallback(
    async (id: string) => {
      await eliminarProductoCatalogo(id);
      await refrescarLista();
    },
    [refrescarLista],
  );

  const restaurarDefault = useCallback(async () => {
    const lista = await resetCatalogo();
    setProductos(lista);
  }, []);

  const porSeccion = useCallback(
    async (seccion: SeccionCatalogo, soloFavoritos = false) =>
      getProductosPorSeccion(seccion, {
        soloActivos: true,
        soloFavoritos,
      }),
    [],
  );

  const buscarPorId = useCallback(
    async (id: string) => getProductoPorId(id),
    [],
  );

  return {
    productos,
    cargando,
    recargar,
    guardar,
    agregar,
    actualizar,
    eliminar,
    restaurarDefault,
    porSeccion,
    buscarPorId,
    crearProductoVacio,
  };
}
