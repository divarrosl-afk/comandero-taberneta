import { crearCatalogoDefault } from "@/data/catalogo-default";
import { migrarProducto } from "@/lib/carta/migrate-producto";
import type { ProductoCatalogo, SeccionCatalogo } from "@/types/catalogo";

const STORAGE_KEY = "comandero-taberneta:catalogo";

function normalizar(producto: ProductoCatalogo): ProductoCatalogo {
  const m = migrarProducto(producto);
  return {
    ...m,
    nombre: m.nombre.trim(),
    precio: m.precioCarta,
  };
}

function ordenarProductos(a: ProductoCatalogo, b: ProductoCatalogo): number {
  if (a.orden !== b.orden) return a.orden - b.orden;
  if (a.favorito !== b.favorito) return a.favorito ? -1 : 1;
  return a.nombre.localeCompare(b.nombre, "es");
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
    const parsed = JSON.parse(raw) as Partial<ProductoCatalogo>[];
    return Array.isArray(parsed)
      ? parsed.map((p) => normalizar(migrarProducto(p)))
      : crearCatalogoDefault();
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
    .sort(ordenarProductos);
}

export function crearProductoVacio(
  seccion: SeccionCatalogo,
): ProductoCatalogo {
  return normalizar({
    id: crypto.randomUUID(),
    nombre: "",
    seccion,
    tipo: seccion === "extras" || seccion === "salsas" ? "carta" : "ambos",
    activo: true,
    agotado: false,
    favorito: false,
    orden: 0,
    ingredientes: [],
    alergenos: [],
    recomendado: false,
  });
}

export function getProductoPorId(id: string): ProductoCatalogo | undefined {
  return getCatalogo().find((p) => p.id === id);
}
