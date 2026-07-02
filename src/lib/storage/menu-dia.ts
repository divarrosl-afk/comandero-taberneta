import { MENU_DIA_DEFAULT, type MenuDiaConfig } from "@/types/menu-dia";

const STORAGE_KEY = "comandero-taberneta:menu-dia";

function normalizar(config: Partial<MenuDiaConfig>): MenuDiaConfig {
  return {
    fecha: config.fecha?.trim() || MENU_DIA_DEFAULT.fecha,
    precioMenu: config.precioMenu && config.precioMenu > 0 ? config.precioMenu : 14,
    primerosIds: Array.isArray(config.primerosIds) ? config.primerosIds : [],
    segundosIds: Array.isArray(config.segundosIds) ? config.segundosIds : [],
    suplementoPrimeros:
      config.suplementoPrimeros && config.suplementoPrimeros > 0
        ? config.suplementoPrimeros
        : undefined,
    suplementoSegundos:
      config.suplementoSegundos && config.suplementoSegundos > 0
        ? config.suplementoSegundos
        : undefined,
    postresIncluidosIds: Array.isArray(config.postresIncluidosIds)
      ? config.postresIncluidosIds
      : [],
    primerosImportados: Array.isArray(config.primerosImportados)
      ? config.primerosImportados
      : undefined,
    segundosImportados: Array.isArray(config.segundosImportados)
      ? config.segundosImportados
      : undefined,
    observaciones: config.observaciones?.trim() || undefined,
    activo: config.activo ?? false,
  };
}

export function getMenuDia(): MenuDiaConfig {
  if (typeof window === "undefined") return MENU_DIA_DEFAULT;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return MENU_DIA_DEFAULT;
    return normalizar(JSON.parse(raw) as Partial<MenuDiaConfig>);
  } catch {
    return MENU_DIA_DEFAULT;
  }
}

export function guardarMenuDia(config: MenuDiaConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizar(config)));
}

export function resetMenuDia(): MenuDiaConfig {
  guardarMenuDia(MENU_DIA_DEFAULT);
  return MENU_DIA_DEFAULT;
}
