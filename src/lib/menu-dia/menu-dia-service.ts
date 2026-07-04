import { getMenuDiaRepository } from "@/lib/data/data-layer";
import {
  getMenuDia as getMenuDiaLocal,
  guardarMenuDia as guardarMenuDiaLocal,
} from "@/lib/storage/menu-dia";
import type { MenuDiaConfig } from "@/types/menu-dia";

function fusionarImportados(
  remoto: MenuDiaConfig,
  local: MenuDiaConfig,
): MenuDiaConfig {
  const primerosRemotos = remoto.primerosImportados?.length ?? 0;
  const primerosLocales = local.primerosImportados?.length ?? 0;
  const segundosRemotos = remoto.segundosImportados?.length ?? 0;
  const segundosLocales = local.segundosImportados?.length ?? 0;

  return {
    ...remoto,
    primerosImportados:
      primerosRemotos >= primerosLocales
        ? remoto.primerosImportados
        : local.primerosImportados,
    segundosImportados:
      segundosRemotos >= segundosLocales
        ? remoto.segundosImportados
        : local.segundosImportados,
    activo: remoto.activo || local.activo,
  };
}

async function mirrorLocal(config: MenuDiaConfig): Promise<MenuDiaConfig> {
  guardarMenuDiaLocal(config);
  return config;
}

export async function getMenuDia(): Promise<MenuDiaConfig> {
  const local = getMenuDiaLocal();
  const remoto = await getMenuDiaRepository().get();
  return mirrorLocal(fusionarImportados(remoto, local));
}

export async function guardarMenuDia(config: MenuDiaConfig): Promise<void> {
  guardarMenuDiaLocal(config);
  try {
    await getMenuDiaRepository().save(config);
  } catch {
    const { primerosImportados, segundosImportados, ...resto } = config;
    await getMenuDiaRepository().save({
      ...resto,
      primerosImportados: undefined,
      segundosImportados: undefined,
    });
  }
}

export async function resetMenuDia(): Promise<MenuDiaConfig> {
  const config = await getMenuDiaRepository().resetDefault();
  return mirrorLocal(config);
}
