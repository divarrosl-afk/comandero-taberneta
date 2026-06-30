import type { ComandaPostres } from "@/types/postres";
import type { EstadoPanel } from "@/types/panel";

const STORAGE_KEY = "comandero-taberneta:postres";

function normalizarPostres(comanda: ComandaPostres): ComandaPostres {
  return {
    ...comanda,
    mesa: typeof comanda.mesa === "number" ? String(comanda.mesa) : comanda.mesa,
    postres: comanda.postres ?? [],
    observaciones: comanda.observaciones ?? [],
    estadoPanel: comanda.estadoPanel ?? "pendiente",
  };
}

export function getPostresLocales(): ComandaPostres[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ComandaPostres[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizarPostres);
  } catch {
    return [];
  }
}

function guardarTodas(comandas: ComandaPostres[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comandas));
}

export function guardarPostresLocal(comanda: ComandaPostres): void {
  const existentes = getPostresLocales();
  existentes.unshift(normalizarPostres(comanda));
  guardarTodas(existentes);
}

export function actualizarPostresLocal(
  id: string,
  cambios: Partial<ComandaPostres>,
): ComandaPostres | null {
  const comandas = getPostresLocales();
  const index = comandas.findIndex((c) => c.id === id);
  if (index === -1) return null;

  comandas[index] = normalizarPostres({ ...comandas[index], ...cambios });
  guardarTodas(comandas);
  return comandas[index];
}

export function actualizarEstadoPostresLocal(
  id: string,
  estadoPanel: EstadoPanel,
): ComandaPostres | null {
  return actualizarPostresLocal(id, { estadoPanel });
}

export function eliminarPostresLocal(id: string): boolean {
  const comandas = getPostresLocales();
  const filtradas = comandas.filter((c) => c.id !== id);
  if (filtradas.length === comandas.length) return false;
  guardarTodas(filtradas);
  return true;
}
