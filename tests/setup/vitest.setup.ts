import { beforeEach, vi } from "vitest";
import { resetDataLayerForTests } from "@/lib/data/data-layer";
import { clearPendingSync } from "@/lib/sync/emergency-local";

export const STORAGE_KEYS = [
  "comandero-taberneta:comandas",
  "comandero-taberneta:postres",
  "comandero-taberneta:sync-pending-cocina",
  "comandero-taberneta:sync-pending-postres",
  "comandero-taberneta:mesas-estado",
  "comandero-taberneta:usuarios",
  "comandero-taberneta:sesion",
  "comandero-taberneta:mesas",
  "comandero-taberneta:catalogo",
  "comandero-taberneta:menu-dia",
  "comandero-taberneta:impresora-config",
  "comandero-taberneta:borrador",
  "comandero-taberneta:borrador-postres",
] as const;

export function clearAllStorage(): void {
  for (const key of STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("NEXT_PUBLIC_DATA_BACKEND", "local");
  clearAllStorage();
  clearPendingSync();
  resetDataLayerForTests();
});
