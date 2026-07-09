import type { ComandaFormState, PlatoFormItem } from "@/types/comanda";
import { crearPostreVacio } from "@/lib/postres/postre-factory";
import { crearPlatoVacio } from "@/lib/comanda/plato-factory";
import { normalizarModificaciones } from "@/lib/comanda/modificaciones";

const BORRADOR_KEY = "comandero-taberneta:borrador";

function normalizarPlatos(platos: PlatoFormItem[]): PlatoFormItem[] {
  return platos.map((p) => ({
    ...p,
    modificaciones: normalizarModificaciones(p.modificaciones),
  }));
}

export function normalizarBorrador(
  form: ComandaFormState & { mesa?: string | number | null },
): ComandaFormState {
  const mesa =
    form.mesa !== null && form.mesa !== undefined
      ? String(form.mesa)
      : null;

  return {
    ...form,
    mesa,
    postres: form.postres?.length ? form.postres : [crearPostreVacio()],
    cafes: form.cafes?.length ? form.cafes : [crearPostreVacio()],
    estadoXCafe: form.estadoXCafe ?? null,
    comensales: form.comensales ?? null,
    entrantes: normalizarPlatos(
      form.entrantes?.length ? form.entrantes : [crearPlatoVacio()],
    ),
    primeros: normalizarPlatos(
      form.primeros?.length ? form.primeros : [crearPlatoVacio()],
    ),
    segundos: normalizarPlatos(
      form.segundos?.length ? form.segundos : [crearPlatoVacio()],
    ),
    bebidas: normalizarPlatos(
      form.bebidas?.length ? form.bebidas : [crearPlatoVacio()],
    ),
    extras: form.extras ?? [],
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
    const form = JSON.parse(raw) as ComandaFormState & {
      mesa?: string | number | null;
    };
    return normalizarBorrador(form);
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
    form.postres.some((p) => p.nombre.trim().length > 0) ||
    form.cafes.some((p) => p.nombre.trim().length > 0) ||
    form.estadoXCafe !== null ||
    form.extras.some((e) => e.cantidad > 0) ||
    form.observaciones.some((o) => o.trim().length > 0)
  );
}
