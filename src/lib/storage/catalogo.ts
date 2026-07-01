import { crearCatalogoDefault } from "@/data/catalogo-default";
import type { ProductoCatalogo, SeccionCatalogo } from "@/types/catalogo";

const STORAGE_KEY = "comandero-taberneta:catalogo";

function normalizar(producto: ProductoCatalogo): ProductoCatalogo {
  return {
    ...producto,
    nombre: producto.nombre.trim(),
    activo: producto.activo ?? true,
    favorito: producto.favorito ?? false,
    precio: producto.precio && producto.precio > 0 ? producto.precio : undefined,
    suplemento:
      producto.suplemento && producto.suplemento > 0
        ? producto.suplemento
        : undefined,
  };
}

export function getCatalogo(): ProductoCatalogo[] {
  if (typeof window === "undefined") return crearCatalogoDefault();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = crearCatalogoDefault();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw) as ProductoCatalogo[];
    return Array.isArray(parsed) ? parsed.map(normalizar) : crearCatalogoDefault();
  } catch {
    return crearCatalogoDefault();
  }
}

export function guardarCatalogo(productos: ProductoCatalogo[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(productos.map(normalizar)),
  );
}

export function resetCatalogo(): ProductoCatalogo[] {
  const defaults = crearCatalogoDefault();
  guardarCatalogo(defaults);
  return defaults;
}

export function getProductosPorSeccion(
  seccion: SeccionCatalogo,
  opts?: { soloActivos?: boolean; soloFavoritos?: boolean },
): ProductoCatalogo[] {
  const soloActivos = opts?.soloActivos ?? true;
  const soloFavoritos = opts?.soloFavoritos ?? false;

  return getCatalogo()
    .filter((p) => p.seccion === seccion)
    .filter((p) => (soloActivos ? p.activo : true))
    .filter((p) => (soloFavoritos ? p.favorito : true))
    .sort((a, b) => {
      if (a.favorito !== b.favorito) return a.favorito ? -1 : 1;
      return a.nombre.localeCompare(b.nombre, "es");
    });
}

export function crearProductoVacio(
  seccion: SeccionCatalogo,
): ProductoCatalogo {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    seccion,
    activo: true,
    favorito: false,
  };
}
