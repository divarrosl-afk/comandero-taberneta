import { claveProductoCatalogo } from "@/lib/catalogo/catalogo-clave";
import type { ProductoCatalogo } from "@/types/catalogo";

const STORAGE_KEY = "comandero-taberneta:catalogo-exclusiones";

function leerClaves(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((v): v is string => typeof v === "string"));
  } catch {
    return new Set();
  }
}

function guardarClaves(claves: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...claves]));
}

export function getClavesExcluidasCatalogo(): Set<string> {
  return leerClaves();
}

export function registrarExclusionCatalogo(
  producto: Pick<ProductoCatalogo, "nombre" | "seccion" | "categoriaCarta">,
): void {
  const claves = leerClaves();
  claves.add(claveProductoCatalogo(producto));
  guardarClaves(claves);
}

export function limpiarExclusionesCatalogo(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
