"use client";

import { useCallback, useEffect, useState } from "react";
import {
  actualizarEstadoComandaLocal,
  getComandasLocales,
} from "@/lib/storage/comandas-local";
import {
  actualizarEstadoPostresLocal,
  getPostresLocales,
} from "@/lib/storage/postres-local";
import type { ComandaCocina } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";
import type { ComandaPostres } from "@/types/postres";

export function usePanel() {
  const [comandasCocina, setComandasCocina] = useState<ComandaCocina[]>([]);
  const [comandasPostres, setComandasPostres] = useState<ComandaPostres[]>([]);

  const recargar = useCallback(() => {
    setComandasCocina(getComandasLocales());
    setComandasPostres(getPostresLocales());
  }, []);

  useEffect(() => {
    recargar();
    const interval = setInterval(recargar, 5000);
    return () => clearInterval(interval);
  }, [recargar]);

  const cambiarEstadoCocina = useCallback(
    (id: string, estado: EstadoPanel) => {
      actualizarEstadoComandaLocal(id, estado);
      recargar();
    },
    [recargar],
  );

  const cambiarEstadoPostres = useCallback(
    (id: string, estado: EstadoPanel) => {
      actualizarEstadoPostresLocal(id, estado);
      recargar();
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
    recargar,
    cambiarEstadoCocina,
    cambiarEstadoPostres,
  };
}
