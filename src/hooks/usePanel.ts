"use client";

import { useCallback, useEffect, useState } from "react";
import {
  actualizarEstadoComanda,
  fetchComandas,
} from "@/lib/comandas/comandas-service";
import {
  actualizarEstadoPostres,
  fetchPostres,
} from "@/lib/postres/postres-service";
import { useSupabaseOperativaRealtime } from "@/hooks/useSupabaseOperativaRealtime";
import type { ComandaCocina } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";
import type { ComandaPostres } from "@/types/postres";

const POLL_MS = 5000;

export function usePanel() {
  const [comandasCocina, setComandasCocina] = useState<ComandaCocina[]>([]);
  const [comandasPostres, setComandasPostres] = useState<ComandaPostres[]>([]);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    const [cocina, postres] = await Promise.all([
      fetchComandas(),
      fetchPostres(),
    ]);
    setComandasCocina(cocina);
    setComandasPostres(postres);
    setCargando(false);
  }, []);

  useEffect(() => {
    void recargar();
    const interval = setInterval(() => void recargar(), POLL_MS);
    return () => clearInterval(interval);
  }, [recargar]);

  useSupabaseOperativaRealtime(() => {
    void recargar();
  });

  const cambiarEstadoCocina = useCallback(
    async (id: string, estado: EstadoPanel) => {
      await actualizarEstadoComanda(id, estado);
      await recargar();
    },
    [recargar],
  );

  const cambiarEstadoPostres = useCallback(
    async (id: string, estado: EstadoPanel) => {
      await actualizarEstadoPostres(id, estado);
      await recargar();
    },
    [recargar],
  );

  const cocinaActivas = comandasCocina.filter((c) => c.estadoPanel !== "servido");
  const postresActivas = comandasPostres.filter((c) => c.estadoPanel !== "servido");

  return {
    comandasCocina,
    comandasPostres,
    cocinaActivas,
    postresActivas,
    cargando,
    recargar,
    cambiarEstadoCocina,
    cambiarEstadoPostres,
  };
}
