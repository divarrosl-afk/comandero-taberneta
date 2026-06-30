import type { Sesion } from "@/types/auth";

const STORAGE_KEY = "comandero-taberneta:sesion";

export function getSesion(): Sesion | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Sesion;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion: Sesion): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
}

export function limpiarSesion(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
