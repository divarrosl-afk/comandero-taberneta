import type { ComandaCocina } from "@/types/comanda";

const STORAGE_KEY = "comandero-taberneta:comandas";

export function getComandasLocales(): ComandaCocina[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ComandaCocina[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function guardarComandaLocal(comanda: ComandaCocina): void {
  const existentes = getComandasLocales();
  existentes.unshift(comanda);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existentes));
}

export function generarIdComanda(): string {
  return `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
