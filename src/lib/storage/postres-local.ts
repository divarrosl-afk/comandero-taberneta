import type { ComandaPostres } from "@/types/postres";

const STORAGE_KEY = "comandero-taberneta:postres";

export function getPostresLocales(): ComandaPostres[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ComandaPostres[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function guardarPostresLocal(comanda: ComandaPostres): void {
  const existentes = getPostresLocales();
  existentes.unshift(comanda);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existentes));
}
