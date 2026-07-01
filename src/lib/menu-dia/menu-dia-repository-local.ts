import {
  getMenuDia,
  guardarMenuDia,
  resetMenuDia,
} from "@/lib/storage/menu-dia";
import type { MenuDiaRepository } from "@/lib/menu-dia/menu-dia-repository";

export const menuDiaRepositoryLocal: MenuDiaRepository = {
  get: async () => getMenuDia(),
  save: async (config) => {
    guardarMenuDia(config);
  },
  resetDefault: async () => resetMenuDia(),
};
