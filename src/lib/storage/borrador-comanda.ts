import type { ComandaFormState } from "@/types/comanda";

const BORRADOR_KEY = "comandero-taberneta:borrador";

export function guardarBorrador(form: ComandaFormState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BORRADOR_KEY, JSON.stringify(form));
}

export function cargarBorrador(): ComandaFormState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(BORRADOR_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ComandaFormState;
  } catch {
    return null;
  }
}

export function limpiarBorrador(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BORRADOR_KEY);
}

export function borradorTieneDatos(form: ComandaFormState): boolean {
  return (
    form.mesa !== null ||
    form.camareroId !== null ||
    [...form.entrantes, ...form.primeros, ...form.segundos, ...form.bebidas].some(
      (p) => p.nombre.trim().length > 0,
    ) ||
    form.extras.some((e) => e.cantidad > 0) ||
    form.observaciones.some((o) => o.trim().length > 0)
  );
}
