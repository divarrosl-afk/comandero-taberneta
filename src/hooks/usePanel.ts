"use client";

import { useCallback, useEffect, useState } from "react";
import {
  actualizarEstadoComanda,
} from "@/lib/comandas/comandas-service";
import {
  actualizarEstadoPostres,
} from "@/lib/postres/postres-service";
import { useSupabaseOperativaRealtime } from "@/hooks/useSupabaseOperativaRealtime";
import { OPERATIVA_POLL_MS } from "@/lib/sync/constants";
import { fetchOperativaData } from "@/lib/sync/operativa-fetch";
import type { ComandaCocina } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";
import type { ComandaPostres } from "@/types/postres";

export function usePanel() {
  const [comandasCocina, setComandasCocina] = useState<ComandaCocina[]>([]);
  const [comandasPostres, setComandasPostres] = useState<ComandaPostres[]>([]);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    try {
      const { cocina, postres } = await fetchOperativaData();
      setComandasCocina(cocina);
      setComandasPostres(postres);
    } catch (e) {
      console.error("[panel] Error al cargar operativa:", e);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void recargar();
    const interval = setInterval(() => void recargar(), OPERATIVA_POLL_MS);
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
