"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSync } from "@/hooks/useAppSync";
import { getMesasRepository } from "@/lib/mesas/mesas-service";
import { guardarMesasConfig } from "@/lib/storage/mesas";
import { getEstadoMesa, getEstadoPanelMesa } from "@/lib/mesas/estado-mesa";
import { fetchOperativaData } from "@/lib/sync/operativa-fetch";
import { usesRemoteData } from "@/lib/data/backend";
import type { MesaConfig, MesaOperativa, ZonaMesa } from "@/types/mesas";

async function ensureMesasRemotas(): Promise<void> {
  if (!usesRemoteData()) return;
  try {
    await fetch("/api/mesas/ensure", { cache: "no-store" });
  } catch {
    /* reintento en siguiente sincronización */
  }
}

export function useMesas() {
  const [mesas, setMesas] = useState<MesaConfig[]>([]);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      let config = await getMesasRepository().getConfig();
      if (config.length === 0 && usesRemoteData()) {
        await ensureMesasRemotas();
        config = await getMesasRepository().getConfig();
      }
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

  useAppSync(() => {
    void recargar();
  });

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
  const { activas, recargar, cargando } = useMesas();
  const [revision, setRevision] = useState(0);

  const refrescar = useCallback(() => {
    setRevision((v) => v + 1);
    void recargar();
  }, [recargar]);

  const refrescarOperativa = useCallback(() => {
    setRevision((v) => v + 1);
  }, []);

  useAppSync(() => {
    refrescarOperativa();
  });

  const operativas: MesaOperativa[] = useMemo(() => {
    void revision;
    return activas.map((m) => ({
      ...m,
      estado: getEstadoMesa(m.id),
      estadoPanel: getEstadoPanelMesa(m.id),
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

  return { operativas, refrescar, porZona, cargando, operativaRevision: revision };
}
