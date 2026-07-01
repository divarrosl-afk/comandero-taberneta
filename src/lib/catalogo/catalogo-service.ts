import { migrarProducto } from "@/lib/carta/migrate-producto";
import { getCatalogoRepository } from "@/lib/data/data-layer";
import type { ProductoCatalogo, SeccionCatalogo } from "@/types/catalogo";

export function crearProductoVacio(
  seccion: SeccionCatalogo,
): ProductoCatalogo {
  return migrarProducto({
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

export async function getCatalogo(): Promise<ProductoCatalogo[]> {
  return getCatalogoRepository().getAll();
}

export async function guardarCatalogo(
  productos: ProductoCatalogo[],
): Promise<void> {
  await getCatalogoRepository().saveAll(productos);
}

export async function resetCatalogo(): Promise<ProductoCatalogo[]> {
  return getCatalogoRepository().resetDefault();
}

export async function getProductosPorSeccion(
  seccion: SeccionCatalogo,
  opts?: { soloActivos?: boolean; soloFavoritos?: boolean },
): Promise<ProductoCatalogo[]> {
  return getCatalogoRepository().getBySeccion(seccion, opts);
}

export async function getProductoPorId(
  id: string,
): Promise<ProductoCatalogo | undefined> {
  return getCatalogoRepository().getById(id);
}
