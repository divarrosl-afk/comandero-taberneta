import { getComandasLocales } from "@/lib/storage/comandas-local";
import { getPostresLocales } from "@/lib/storage/postres-local";
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
  const cocina = getComandasLocales().filter((c) => String(c.mesa) === mesaId);
  const postres = getPostresLocales().filter((c) => String(c.mesa) === mesaId);
  const todas = [...cocina, ...postres];

  if (todas.length === 0) return "libre";

  const pendientes = todas.some(
    (c) =>
      c.estadoPanel === "pendiente" ||
      c.estadoPanel === "en_preparacion" ||
      c.estadoPanel === "listo",
  );
  if (pendientes) return "pendiente";

  if (todas.every((c) => c.estadoPanel === "servido")) return "servida";

  return "ocupada";
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
  const cocina = getComandasLocales().filter((c) => String(c.mesa) === mesaId);
  const postres = getPostresLocales().filter((c) => String(c.mesa) === mesaId);
  return { cocina, postres, total: cocina.length + postres.length };
}

export function limpiarEstadoMesa(mesaId: string): void {
  guardarEstados(getEstadosRaw().filter((e) => e.mesaId !== mesaId));
}
