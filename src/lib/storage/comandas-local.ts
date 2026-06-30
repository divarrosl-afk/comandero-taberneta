import type { ComandaCocina } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";

const STORAGE_KEY = "comandero-taberneta:comandas";

function normalizarPlato<T extends { modificaciones?: string[]; salsas?: { nombre: string; cantidad: number }[] }>(
  plato: T,
): T {
  return {
    ...plato,
    modificaciones: plato.modificaciones ?? [],
    salsas: plato.salsas ?? [],
  };
}

function migrarMesa(mesa: string | number): string {
  return typeof mesa === "number" ? String(mesa) : mesa;
}

function normalizarComanda(comanda: ComandaCocina): ComandaCocina {
  return {
    ...comanda,
    mesa: migrarMesa(comanda.mesa as string | number),
    entrantes: comanda.entrantes.map(normalizarPlato),
    primeros: comanda.primeros.map(normalizarPlato),
    segundos: comanda.segundos.map(normalizarPlato),
    bebidas: comanda.bebidas.map(normalizarPlato),
    extras: comanda.extras ?? [],
    observaciones: comanda.observaciones ?? [],
    estadoPanel: comanda.estadoPanel ?? "pendiente",
  };
}

export function getComandasLocales(): ComandaCocina[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ComandaCocina[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizarComanda);
  } catch {
    return [];
  }
}

function guardarTodas(comandas: ComandaCocina[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comandas));
}

export function guardarComandaLocal(comanda: ComandaCocina): void {
  const existentes = getComandasLocales();
  existentes.unshift(normalizarComanda(comanda));
  guardarTodas(existentes);
}

export function actualizarComandaLocal(
  id: string,
  cambios: Partial<ComandaCocina>,
): ComandaCocina | null {
  const comandas = getComandasLocales();
  const index = comandas.findIndex((c) => c.id === id);
  if (index === -1) return null;

  comandas[index] = normalizarComanda({ ...comandas[index], ...cambios });
  guardarTodas(comandas);
  return comandas[index];
}

export function actualizarEstadoComandaLocal(
  id: string,
  estadoPanel: EstadoPanel,
): ComandaCocina | null {
  return actualizarComandaLocal(id, { estadoPanel });
}

export function eliminarComandaLocal(id: string): boolean {
  const comandas = getComandasLocales();
  const filtradas = comandas.filter((c) => c.id !== id);
  if (filtradas.length === comandas.length) return false;
  guardarTodas(filtradas);
  return true;
}

export function generarIdComanda(): string {
  return `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
