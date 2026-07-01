"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getMesasRepository } from "@/lib/mesas/mesas-service";
import { getEstadoMesa } from "@/lib/mesas/estado-mesa";
import type { MesaConfig, MesaOperativa, ZonaMesa } from "@/types/mesas";

export function useMesas() {
  const [mesas, setMesas] = useState<MesaConfig[]>([]);

  const recargar = useCallback(() => {
    setMesas(getMesasRepository().getConfig());
  }, []);

  useEffect(() => {
    recargar();
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
    (mesa: MesaConfig) => {
      const creada = getMesasRepository().crear(mesa);
      recargar();
      return creada;
    },
    [recargar],
  );

  const actualizar = useCallback(
    (id: string, cambios: Partial<MesaConfig>) => {
      const m = getMesasRepository().actualizar(id, cambios);
      recargar();
      return m;
    },
    [recargar],
  );

  const restaurarDefault = useCallback(() => {
    getMesasRepository().restaurarDefault();
    recargar();
  }, [recargar]);

  return { mesas, activas, porZona, recargar, crear, actualizar, restaurarDefault };
}

export function useMesasOperativas() {
  const { activas, recargar } = useMesas();
  const [revision, setRevision] = useState(0);

  const refrescar = useCallback(() => {
    setRevision((v) => v + 1);
    recargar();
  }, [recargar]);

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
