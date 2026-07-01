import {
  actualizarMesaConfig,
  crearMesaConfig,
  getMesaConfig,
  getMesasConfig,
  guardarMesasConfig,
  resetMesasConfig,
} from "@/lib/storage/mesas";
import type { MesasRepository } from "@/lib/mesas/mesas-repository";
import type { MesaConfig } from "@/types/mesas";

export const mesasRepositoryLocal: MesasRepository = {
  getConfig: async () => getMesasConfig(),
  getById: async (id) => getMesaConfig(id),
  guardarConfig: async (mesas) => {
    guardarMesasConfig(mesas);
  },
  crear: async (mesa) => crearMesaConfig(mesa),
  actualizar: async (id, cambios) => actualizarMesaConfig(id, cambios),
  restaurarDefault: async () => resetMesasConfig(),
};
