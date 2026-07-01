"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getMesasRepository } from "@/lib/mesas/mesas-service";
import { guardarMesasConfig } from "@/lib/storage/mesas";
import { getEstadoMesa } from "@/lib/mesas/estado-mesa";
import { fetchComandas } from "@/lib/comandas/comandas-service";
import { fetchPostres } from "@/lib/postres/postres-service";
import { usesRemoteData } from "@/lib/data/backend";
import { useSupabaseOperativaRealtime } from "@/hooks/useSupabaseOperativaRealtime";
import type { MesaConfig, MesaOperativa, ZonaMesa } from "@/types/mesas";

export function useMesas() {
  const [mesas, setMesas] = useState<MesaConfig[]>([]);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      const config = await getMesasRepository().getConfig();
      if (usesRemoteData()) {
        guardarMesasConfig(config);
      }
      setMesas(config);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const activas = mesas.filter((m) => m.activa);

  const porZona = useCallback(
    (zona: ZonaMesa) =>
      activas
        .filter((m) => m.zona === zona)
        .sort((a, b) => a.orden - b.orden || a.codigo.localeCompare(b.codigo, "es")),
    [activas],
  );

  const crear = useCallback(
    async (mesa: MesaConfig) => {
      const creada = await getMesasRepository().crear(mesa);
      await recargar();
      return creada;
    },
    [recargar],
  );

  const actualizar = useCallback(
    async (id: string, cambios: Partial<MesaConfig>) => {
      const m = await getMesasRepository().actualizar(id, cambios);
      await recargar();
      return m;
    },
    [recargar],
  );

  const restaurarDefault = useCallback(async () => {
    await getMesasRepository().restaurarDefault();
    await recargar();
  }, [recargar]);

  return {
    mesas,
    activas,
    cargando,
    porZona,
    recargar,
    crear,
    actualizar,
    restaurarDefault,
  };
}

export function useMesasOperativas() {
  const { activas, recargar } = useMesas();
  const [revision, setRevision] = useState(0);

  const refrescar = useCallback(() => {
    setRevision((v) => v + 1);
    void recargar();
  }, [recargar]);

  const refrescarOperativa = useCallback(async () => {
    if (usesRemoteData()) {
      await Promise.all([fetchComandas(), fetchPostres()]);
    }
    setRevision((v) => v + 1);
  }, []);

  useSupabaseOperativaRealtime(() => {
    void refrescarOperativa();
  });

  useEffect(() => {
    if (!usesRemoteData()) return;
    const interval = setInterval(() => void refrescarOperativa(), 5000);
    return () => clearInterval(interval);
  }, [refrescarOperativa]);

  const operativas: MesaOperativa[] = useMemo(() => {
    void revision;
    return activas.map((m) => ({
      ...m,
      estado: getEstadoMesa(m.id),
    }));
  }, [activas, revision]);

  const porZona = useCallback(
    (zona: ZonaMesa) =>
      operativas
        .filter((m) => m.zona === zona)
        .sort(
          (a, b) =>
            a.orden - b.orden || a.codigo.localeCompare(b.codigo, "es"),
        ),
    [operativas],
  );

  return { operativas, refrescar, porZona };
}
