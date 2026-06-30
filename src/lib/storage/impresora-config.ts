import {
  IMPRESORA_DEFAULT,
  type ImpresoraConfig,
} from "@/types/impresora";

const STORAGE_KEY = "comandero-taberneta:impresora-config";

function normalizar(config: ImpresoraConfig): ImpresoraConfig {
  return {
    nombre: config.nombre?.trim() || IMPRESORA_DEFAULT.nombre,
    ip: config.ip?.trim() ?? "",
    puerto: config.puerto > 0 ? config.puerto : 9100,
    anchoPapel: config.anchoPapel === "58mm" ? "58mm" : "80mm",
    activa: config.activa ?? true,
    modo: config.modo === "network" ? "network" : "mock",
  };
}

export function getImpresoraConfig(): ImpresoraConfig {
  if (typeof window === "undefined") return IMPRESORA_DEFAULT;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return IMPRESORA_DEFAULT;
    return normalizar(JSON.parse(raw) as ImpresoraConfig);
  } catch {
    return IMPRESORA_DEFAULT;
  }
}

export function guardarImpresoraConfig(config: ImpresoraConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizar(config)));
}

export function resetImpresoraConfig(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
