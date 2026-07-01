import { esMismaFecha } from "@/lib/cierre/fecha";
import type { PostresRepository } from "@/lib/postres/postres-repository";
import {
  actualizarEstadoPostresLocal,
  actualizarPostresLocal,
  eliminarPostresLocal,
  getPostresLocales,
  guardarPostresLocal,
} from "@/lib/storage/postres-local";

export const postresRepositoryLocal: PostresRepository = {
  getAll: async () => getPostresLocales(),

  getById: async (id) => getPostresLocales().find((c) => c.id === id),

  crear: async (comanda) => {
    guardarPostresLocal(comanda);
    return comanda;
  },

  actualizar: async (id, cambios) => actualizarPostresLocal(id, cambios),

  actualizarEstado: async (id, estado) =>
    actualizarEstadoPostresLocal(id, estado),

  eliminar: async (id) => eliminarPostresLocal(id),

  eliminarDelDia: async (fecha) => {
    const todas = getPostresLocales();
    const restantes = todas.filter((c) => !esMismaFecha(c.creadaEn, fecha));
    const eliminadas = todas.length - restantes.length;
    if (eliminadas > 0) {
      localStorage.setItem(
        "comandero-taberneta:postres",
        JSON.stringify(restantes),
      );
    }
    return eliminadas;
  },
};
