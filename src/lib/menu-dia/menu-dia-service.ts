import { getMenuDiaRepository } from "@/lib/data/data-layer";
import {
  getMenuDia as getMenuDiaLocal,
  guardarMenuDia as guardarMenuDiaLocal,
} from "@/lib/storage/menu-dia";
import { menuTienePlatosImportados } from "@/lib/menu-dia/menu-platos-comanda";
import type { MenuDiaConfig } from "@/types/menu-dia";

function elegirMenu(local: MenuDiaConfig, remoto: MenuDiaConfig): MenuDiaConfig {
  const remotoTiene = menuTienePlatosImportados(remoto);
  const localTiene = menuTienePlatosImportados(local);

  if (remotoTiene) return remoto;
  if (localTiene) return local;
  if (remoto.activo) return remoto;
  return local;
}

async function mirrorLocal(config: MenuDiaConfig): Promise<MenuDiaConfig> {
  guardarMenuDiaLocal(config);
  return config;
}

export async function getMenuDia(): Promise<MenuDiaConfig> {
  const local = getMenuDiaLocal();

  try {
    const remoto = await getMenuDiaRepository().get();
    const elegido = elegirMenu(local, remoto);

    if (!menuTienePlatosImportados(remoto) && menuTienePlatosImportados(local)) {
      void getMenuDiaRepository()
        .save(local)
        .catch(() => undefined);
    }

    return mirrorLocal(elegido);
  } catch {
    return local;
  }
}

export async function guardarMenuDia(config: MenuDiaConfig): Promise<void> {
  guardarMenuDiaLocal(config);
  await getMenuDiaRepository().save(config);
}

export async function quitarMenuDia(): Promise<MenuDiaConfig> {
  const config = await getMenuDiaRepository().resetDefault();
  return mirrorLocal(config);
}

export async function resetMenuDia(): Promise<MenuDiaConfig> {
  return quitarMenuDia();
}
