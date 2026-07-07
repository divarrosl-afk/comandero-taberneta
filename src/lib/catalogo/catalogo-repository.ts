import type { ProductoCatalogo, SeccionCatalogo } from "@/types/catalogo";

export interface CatalogoRepository {
  getAll(): Promise<ProductoCatalogo[]>;
  saveAll(productos: ProductoCatalogo[]): Promise<void>;
  eliminar(id: string): Promise<void>;
  resetDefault(): Promise<ProductoCatalogo[]>;
  getBySeccion(
    seccion: SeccionCatalogo,
    opts?: { soloActivos?: boolean; soloFavoritos?: boolean },
  ): Promise<ProductoCatalogo[]>;
  getById(id: string): Promise<ProductoCatalogo | undefined>;
}
