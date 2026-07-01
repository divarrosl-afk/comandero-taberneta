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
  localStorage.setItem(key, JSON.stringify(items));
}

export function getPendingCocina<T>(): T[] {
  return readPending<T>(PENDING_COCINA_KEY);
}

export function getPendingPostres<T>(): T[] {
  return readPending<T>(PENDING_POSTRES_KEY);
}

export function addPendingCocina<T extends { id: string }>(item: T): void {
  const items = readPending<T>(PENDING_COCINA_KEY).filter((i) => i.id !== item.id);
  items.unshift(item);
  writePending(PENDING_COCINA_KEY, items);
}

export function addPendingPostres<T extends { id: string }>(item: T): void {
  const items = readPending<T>(PENDING_POSTRES_KEY).filter((i) => i.id !== item.id);
  items.unshift(item);
  writePending(PENDING_POSTRES_KEY, items);
}

export function countPendingSync(): number {
  return getPendingCocina().length + getPendingPostres().length;
}

export function clearPendingSync(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PENDING_COCINA_KEY);
  localStorage.removeItem(PENDING_POSTRES_KEY);
}
