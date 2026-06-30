import type { PostresFormState } from "@/types/postres";
import { postreTieneContenido } from "@/lib/postres/postre-factory";

const BORRADOR_KEY = "comandero-taberneta:borrador-postres";

export function guardarBorradorPostres(form: PostresFormState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BORRADOR_KEY, JSON.stringify(form));
}

export function cargarBorradorPostres(): PostresFormState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(BORRADOR_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PostresFormState;
  } catch {
    return null;
  }
}

export function limpiarBorradorPostres(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BORRADOR_KEY);
}

export function borradorPostresTieneDatos(form: PostresFormState): boolean {
  return (
    form.mesa !== null ||
    form.camareroId !== null ||
    form.postres.some(postreTieneContenido) ||
    form.estadoX !== null ||
    form.clH ||
    form.observaciones.some((o) => o.trim().length > 0)
  );
}
