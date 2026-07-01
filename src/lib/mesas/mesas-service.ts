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
  getConfig: getMesasConfig,
  getById: getMesaConfig,
  guardarConfig: guardarMesasConfig,
  crear: crearMesaConfig,
  actualizar: actualizarMesaConfig,
  restaurarDefault: resetMesasConfig,
};

let repo: MesasRepository = mesasRepositoryLocal;

export function getMesasRepository(): MesasRepository {
  return repo;
}

export function setMesasRepository(nuevo: MesasRepository): void {
  repo = nuevo;
}
