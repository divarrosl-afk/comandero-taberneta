"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppSync } from "@/hooks/useAppSync";
import {
  actualizarEstadoComanda,
  eliminarComanda,
} from "@/lib/comandas/comandas-service";
import {
  actualizarEstadoPostres,
} from "@/lib/postres/postres-service";
import { fetchOperativaData } from "@/lib/sync/operativa-fetch";
import type { ComandaCocina } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";
import { isEstadoPanelActivo, normalizeEstadoPanel } from "@/types/panel";
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
  }, [recargar]);

  useAppSync(() => {
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

  const eliminarCocina = useCallback(
    async (id: string) => {
      await eliminarComanda(id);
      await recargar();
    },
    [recargar],
  );

  const cocinaActivas = comandasCocina.filter((c) =>
    isEstadoPanelActivo(normalizeEstadoPanel(c.estadoPanel)),
  );
  const postresActivas = comandasPostres.filter((c) =>
    isEstadoPanelActivo(normalizeEstadoPanel(c.estadoPanel)),
  );

  return {
    comandasCocina,
    comandasPostres,
    cocinaActivas,
    postresActivas,
    cargando,
    recargar,
    cambiarEstadoCocina,
    cambiarEstadoPostres,
    eliminarCocina,
  };
}
