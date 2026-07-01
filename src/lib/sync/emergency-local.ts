import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";
import type { EstadoPanel } from "@/types/panel";

const PENDING_COCINA_KEY = "comandero-taberneta:sync-pending-cocina";
const PENDING_POSTRES_KEY = "comandero-taberneta:sync-pending-postres";

function readPending<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePending<T>(key: string, items: T[]): void {
  if (typeof window === "undefined") return;
  if (items.length === 0) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, JSON.stringify(items));
}

export function getPendingCocina(): ComandaCocina[] {
  return readPending<ComandaCocina>(PENDING_COCINA_KEY);
}

export function getPendingPostres(): ComandaPostres[] {
  return readPending<ComandaPostres>(PENDING_POSTRES_KEY);
}

export function addPendingCocina(item: ComandaCocina): void {
  const items = getPendingCocina().filter((i) => i.id !== item.id);
  items.unshift(item);
  writePending(PENDING_COCINA_KEY, items);
}

export function addPendingPostres(item: ComandaPostres): void {
  const items = getPendingPostres().filter((i) => i.id !== item.id);
  items.unshift(item);
  writePending(PENDING_POSTRES_KEY, items);
}

export function removePendingCocina(id: string): void {
  writePending(
    PENDING_COCINA_KEY,
    getPendingCocina().filter((i) => i.id !== id),
  );
}

export function removePendingPostres(id: string): void {
  writePending(
    PENDING_POSTRES_KEY,
    getPendingPostres().filter((i) => i.id !== id),
  );
}

export function updatePendingCocinaEstado(
  id: string,
  estado: EstadoPanel,
): ComandaCocina | null {
  const items = getPendingCocina();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], estadoPanel: estado };
  writePending(PENDING_COCINA_KEY, items);
  return items[idx];
}

export function updatePendingPostresEstado(
  id: string,
  estado: EstadoPanel,
): ComandaPostres | null {
  const items = getPendingPostres();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], estadoPanel: estado };
  writePending(PENDING_POSTRES_KEY, items);
  return items[idx];
}

export function countPendingSync(): number {
  return getPendingCocina().length + getPendingPostres().length;
}

export function clearPendingSync(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PENDING_COCINA_KEY);
  localStorage.removeItem(PENDING_POSTRES_KEY);
}
