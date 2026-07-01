import type { MenuDiaConfig } from "@/types/menu-dia";

export interface MenuDiaRepository {
  get(): Promise<MenuDiaConfig>;
  save(config: MenuDiaConfig): Promise<void>;
  resetDefault(): Promise<MenuDiaConfig>;
}
