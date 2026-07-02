import { comandaPerteneceAMesa } from "@/lib/mesas/resolve-mesa";
import { getComandasSync } from "@/lib/comandas/comandas-service";
import { getPostresSync } from "@/lib/postres/postres-service";
import { fetchOperativaData } from "@/lib/sync/operativa-fetch";
import { usesRemoteData } from "@/lib/data/backend";
import {
  indiceEstadoPanel,
  isEstadoPanelActivo,
  isEstadoPanelTerminal,
  normalizeEstadoPanel,
  type EstadoPanel,
} from "@/types/panel";
import type {
  EstadoMesaOperativo,
  MesaEstadoPersistido,
} from "@/types/mesas";

const STORAGE_KEY = "comandero-taberneta:mesas-estado";

function getEstadosRaw(): MesaEstadoPersistido[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MesaEstadoPersistido[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function guardarEstados(estados: MesaEstadoPersistido[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estados));
}

function getEstadoPersistido(mesaId: string): MesaEstadoPersistido | undefined {
  return getEstadosRaw().find((e) => e.mesaId === mesaId);
}

function setEstadoPersistido(
  mesaId: string,
  estado: EstadoMesaOperativo,
  manual: boolean,
): void {
  const estados = getEstadosRaw().filter((e) => e.mesaId !== mesaId);
  estados.push({
    mesaId,
    estado,
    manual,
    actualizadaEn: new Date().toISOString(),
  });
  guardarEstados(estados);
}

function calcularEstadoDesdeComandas(mesaId: string): EstadoMesaOperativo {
  const cocina = getComandasSync().filter((c) => comandaPerteneceAMesa(c, mesaId));
  const postres = getPostresSync().filter((c) => comandaPerteneceAMesa(c, mesaId));
  const todas = [...cocina, ...postres].map((c) => ({
    ...c,
    estadoPanel: normalizeEstadoPanel(c.estadoPanel),
  }));

  if (todas.length === 0) return "libre";

  if (todas.every((c) => c.estadoPanel === "mesa_libre")) return "libre";

  if (todas.every((c) => isEstadoPanelTerminal(c.estadoPanel))) return "servida";

  if (todas.some((c) => isEstadoPanelActivo(c.estadoPanel))) return "pendiente";

  return "ocupada";
}

function elegirEstadoPanelMasAvanzado(estados: EstadoPanel[]): EstadoPanel {
  return estados.reduce((mejor, actual) =>
    indiceEstadoPanel(actual) > indiceEstadoPanel(mejor) ? actual : mejor,
  );
}

/** Estado de marcha del panel cocina para mostrar en la vista mesas. */
export function getEstadoPanelMesa(mesaId: string): EstadoPanel | null {
  const persistido = getEstadoPersistido(mesaId);
  if (persistido?.manual) {
    if (persistido.estado === "libre") return "mesa_libre";
    if (persistido.estado === "cobrando") return null;
  }

  const { cocina, postres } = getComandasDeMesa(mesaId);
  const cocinaEstados = cocina.map((c) =>
    normalizeEstadoPanel(c.estadoPanel),
  );
  const postresEstados = postres.map((c) =>
    normalizeEstadoPanel(c.estadoPanel),
  );
  const todas = [...cocinaEstados, ...postresEstados];

  if (todas.length === 0) {
    return getEstadoMesa(mesaId) === "ocupada" ? null : "mesa_libre";
  }

  if (todas.every((e) => e === "mesa_libre")) return "mesa_libre";

  const activasCocina = cocinaEstados.filter(isEstadoPanelActivo);
  if (activasCocina.length > 0) {
    return elegirEstadoPanelMasAvanzado(activasCocina);
  }

  const activasPostres = postresEstados.filter(isEstadoPanelActivo);
  if (activasPostres.length > 0) {
    return elegirEstadoPanelMasAvanzado(activasPostres);
  }

  if (todas.every(isEstadoPanelTerminal)) {
    return elegirEstadoPanelMasAvanzado(todas);
  }

  return null;
}

export function getEstadoMesa(mesaId: string): EstadoMesaOperativo {
  const persistido = getEstadoPersistido(mesaId);
  if (persistido?.manual) return persistido.estado;
  return calcularEstadoDesdeComandas(mesaId);
}

export function marcarMesaCobrando(mesaId: string): void {
  setEstadoPersistido(mesaId, "cobrando", true);
}

export function liberarMesa(mesaId: string): void {
  setEstadoPersistido(mesaId, "libre", true);
}

export function marcarMesaOcupada(mesaId: string): void {
  const actual = getEstadoMesa(mesaId);
  if (actual === "libre") {
    setEstadoPersistido(mesaId, "ocupada", false);
  }
}

export function notificarComandaEnviada(mesaId: string): void {
  const persistido = getEstadoPersistido(mesaId);
  if (persistido?.manual && persistido.estado === "cobrando") return;
  setEstadoPersistido(mesaId, "pendiente", false);
}

export function getComandasDeMesa(mesaId: string) {
  const cocina = getComandasSync().filter((c) => comandaPerteneceAMesa(c, mesaId));
  const postres = getPostresSync().filter((c) => comandaPerteneceAMesa(c, mesaId));
  return { cocina, postres, total: cocina.length + postres.length };
}

export function limpiarEstadoMesa(mesaId: string): void {
  guardarEstados(getEstadosRaw().filter((e) => e.mesaId !== mesaId));
}

/** Refresca caché operativa desde Supabase (modo remoto). */
export async function refrescarEstadoMesasDesdeRemoto(): Promise<void> {
  if (!usesRemoteData()) return;
  await fetchOperativaData();
}
