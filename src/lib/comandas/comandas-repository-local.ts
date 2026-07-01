import {
  actualizarComandaLocal,
  actualizarEstadoComandaLocal,
  eliminarComandaLocal,
  getComandasLocales,
  guardarComandaLocal,
} from "@/lib/storage/comandas-local";
import { esMismaFecha } from "@/lib/cierre/fecha";
import type { ComandasRepository } from "@/lib/comandas/comandas-repository";
import type { ComandaCocina } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";

export const comandasRepositoryLocal: ComandasRepository = {
  getAll: async () => getComandasLocales(),

  getById: async (id) => getComandasLocales().find((c) => c.id === id),

  crear: async (comanda) => {
    guardarComandaLocal(comanda);
    return comanda;
  },

  actualizar: async (id, cambios) => actualizarComandaLocal(id, cambios),

  actualizarEstado: async (id, estado) =>
    actualizarEstadoComandaLocal(id, estado),

  eliminar: async (id) => eliminarComandaLocal(id),

  eliminarDelDia: async (fecha) => {
    const todas = getComandasLocales();
    const restantes = todas.filter((c) => !esMismaFecha(c.creadaEn, fecha));
    const eliminadas = todas.length - restantes.length;
    if (eliminadas > 0) {
      localStorage.setItem(
        "comandero-taberneta:comandas",
        JSON.stringify(restantes),
      );
    }
    return eliminadas;
  },
};
