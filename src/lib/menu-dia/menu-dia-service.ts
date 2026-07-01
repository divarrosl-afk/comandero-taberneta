import { getMenuDiaRepository } from "@/lib/data/data-layer";
import {
  getMenuDia as getMenuDiaLocal,
  guardarMenuDia as guardarMenuDiaLocal,
} from "@/lib/storage/menu-dia";
import type { MenuDiaConfig } from "@/types/menu-dia";

async function mirrorLocal(config: MenuDiaConfig): Promise<MenuDiaConfig> {
  guardarMenuDiaLocal(config);
  return config;
}

export async function getMenuDia(): Promise<MenuDiaConfig> {
  const config = await getMenuDiaRepository().get();
  return mirrorLocal(config);
}

export async function guardarMenuDia(config: MenuDiaConfig): Promise<void> {
  guardarMenuDiaLocal(config);
  await getMenuDiaRepository().save(config);
}

export async function resetMenuDia(): Promise<MenuDiaConfig> {
  const config = await getMenuDiaRepository().resetDefault();
  return mirrorLocal(config);
}
