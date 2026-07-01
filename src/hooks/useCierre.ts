"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchComandas } from "@/lib/comandas/comandas-service";
import { fetchPostres } from "@/lib/postres/postres-service";
import { usesRemoteData } from "@/lib/data/backend";
import { hoyFecha } from "@/lib/cierre/fecha";
import {
  getCamarerosDelDia,
  getEntradasDelDia,
  getMesasDelDia,
  filtrarEntradas,
} from "@/lib/cierre/filtros";
import { calcularResumenCierre } from "@/lib/cierre/metricas";
import {
  generarExportacionCierre,
  resumenExportacion,
  type ExportacionCierre,
} from "@/lib/cierre/exportar";
import { contarDatosDelDia, eliminarDatosDelDia } from "@/lib/storage/cierre";
import type { Sesion } from "@/types/auth";
import {
  FILTRO_TODOS_CAMARERO,
  type EntradaCierre,
  type FiltrosCierre,
  type ResumenCierre,
} from "@/types/cierre";

function filtrosIniciales(): FiltrosCierre {
  return {
    fecha: hoyFecha(),
    camarero: FILTRO_TODOS_CAMARERO,
    mesa: null,
    tipo: "todos",
    estado: "todos",
  };
}

export function useCierre(sesion: Sesion | null) {
  const [filtros, setFiltros] = useState<FiltrosCierre>(filtrosIniciales);
  const [revision, setRevision] = useState(0);

  const recargar = useCallback(() => {
    setRevision((v) => v + 1);
  }, []);

  useEffect(() => {
    if (!usesRemoteData()) return;
    void Promise.all([fetchComandas(), fetchPostres()]).then(() => recargar());
  }, [filtros.fecha, recargar]);

  const entradasDia: EntradaCierre[] = useMemo(() => {
    void revision;
    return getEntradasDelDia(filtros.fecha);
  }, [filtros.fecha, revision]);

  const entradasFiltradas = useMemo(() => {
    void revision;
    return filtrarEntradas(entradasDia, filtros);
  }, [entradasDia, filtros, revision]);

  const resumen: ResumenCierre = useMemo(() => {
    void revision;
    return calcularResumenCierre(filtros);
  }, [filtros, revision]);

  const camareros = useMemo(() => {
    void revision;
    return getCamarerosDelDia(filtros.fecha);
  }, [filtros.fecha, revision]);

  const mesas = useMemo(() => {
    void revision;
    return getMesasDelDia(filtros.fecha);
  }, [filtros.fecha, revision]);

  const conteoDia = useMemo(() => {
    void revision;
    return contarDatosDelDia(filtros.fecha);
  }, [filtros.fecha, revision]);

  const actualizarFiltros = useCallback((cambios: Partial<FiltrosCierre>) => {
    setFiltros((prev) => ({ ...prev, ...cambios }));
  }, []);

  const prepararExportacion = useCallback((): ExportacionCierre | null => {
    if (!sesion) return null;
    return generarExportacionCierre(filtros.fecha, sesion);
  }, [filtros.fecha, sesion]);

  const previewExportacion = useCallback(() => {
    const datos = prepararExportacion();
    return datos ? resumenExportacion(datos) : null;
  }, [prepararExportacion]);

  const borrarDia = useCallback(async () => {
    const resultado = await eliminarDatosDelDia(filtros.fecha);
    recargar();
    return resultado;
  }, [filtros.fecha, recargar]);

  return {
    filtros,
    actualizarFiltros,
    entradasFiltradas,
    resumen,
    camareros,
    mesas,
    conteoDia,
    recargar,
    prepararExportacion,
    previewExportacion,
    borrarDia,
  };
}
