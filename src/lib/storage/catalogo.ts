import {
  CATALOGO_VERSION,
  crearCatalogoDefault,
} from "@/data/catalogo-default";
import { mergeCatalogoCompleto } from "@/lib/setup/sync-catalogo";
import { migrarProducto } from "@/lib/carta/migrate-producto";
import { createId } from "@/lib/id/create-id";
import type { ProductoCatalogo, SeccionCatalogo } from "@/types/catalogo";

const STORAGE_KEY = "comandero-taberneta:catalogo";
const VERSION_KEY = "comandero-taberneta:catalogo-version";

function guardarVersion(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VERSION_KEY, String(CATALOGO_VERSION));
}

function necesitaActualizarCatalogo(): boolean {
  if (typeof window === "undefined") return false;
  const guardada = Number(localStorage.getItem(VERSION_KEY) ?? 0);
  return guardada !== CATALOGO_VERSION;
}

function instalarCatalogoDefault(): ProductoCatalogo[] {
  const defaults = crearCatalogoDefault();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  guardarVersion();
  return defaults;
}

function actualizarCatalogoSiNecesario(): ProductoCatalogo[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  let existentes: ProductoCatalogo[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<ProductoCatalogo>[];
      if (Array.isArray(parsed)) {
        existentes = parsed.map((p) => normalizar(migrarProducto(p)));
      }
    } catch {
      existentes = [];
    }
  }
  const merged = mergeCatalogoCompleto(existentes, crearCatalogoDefault()).map(
    normalizar,
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  guardarVersion();
  return merged;
}

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
    if (necesitaActualizarCatalogo()) {
      return actualizarCatalogoSiNecesario();
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return instalarCatalogoDefault();
    }
    const parsed = JSON.parse(raw) as Partial<ProductoCatalogo>[];
    return Array.isArray(parsed)
      ? parsed.map((p) => normalizar(migrarProducto(p)))
      : instalarCatalogoDefault();
  } catch {
    return instalarCatalogoDefault();
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
  return instalarCatalogoDefault();
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
    id: createId(),
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
