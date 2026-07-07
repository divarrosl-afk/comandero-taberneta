import {
  getCatalogo,
  getProductoPorId,
  getProductosPorSeccion,
  guardarCatalogo,
  resetCatalogo,
} from "@/lib/storage/catalogo";
import type { CatalogoRepository } from "@/lib/catalogo/catalogo-repository";
import type { SeccionCatalogo } from "@/types/catalogo";

export const catalogoRepositoryLocal: CatalogoRepository = {
  getAll: async () => getCatalogo(),
  saveAll: async (productos) => {
    guardarCatalogo(productos);
  },
  eliminar: async (id) => {
    const lista = getCatalogo().filter((p) => p.id !== id);
    guardarCatalogo(lista);
  },
  resetDefault: async () => resetCatalogo(),
  getBySeccion: async (seccion, opts) =>
    getProductosPorSeccion(seccion, opts),
  getById: async (id) => getProductoPorId(id),
};
