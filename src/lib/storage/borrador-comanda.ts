import type { ComandaFormState } from "@/types/comanda";
import { crearPlatoVacio } from "@/lib/comanda/plato-factory";

const BORRADOR_KEY = "comandero-taberneta:borrador";

export function normalizarBorrador(
  form: Partial<ComandaFormState>,
): ComandaFormState {
  return {
    mesa: form.mesa ?? null,
    camareroId: form.camareroId ?? null,
    entrantes: form.entrantes?.length ? form.entrantes : [crearPlatoVacio()],
    primeros: form.primeros?.length ? form.primeros : [crearPlatoVacio()],
    segundos: form.segundos?.length ? form.segundos : [crearPlatoVacio()],
    bebidas: form.bebidas?.length ? form.bebidas : [crearPlatoVacio()],
    extras: Array.isArray(form.extras) ? form.extras : [],
    observaciones: form.observaciones?.length ? form.observaciones : [""],
  };
}

export function guardarBorrador(form: ComandaFormState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BORRADOR_KEY, JSON.stringify(form));
}

export function cargarBorrador(): ComandaFormState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(BORRADOR_KEY);
    if (!raw) return null;
    const form = normalizarBorrador(
      JSON.parse(raw) as ComandaFormState & { mesa?: string | number | null },
    );
    if (form.mesa !== null && form.mesa !== undefined && typeof form.mesa === "number") {
      form.mesa = String(form.mesa);
    }
    return form;
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
    (form.extras ?? []).some((e) => Number(e.cantidad) > 0) ||
    form.observaciones.some((o) => o.trim().length > 0)
  );
}
