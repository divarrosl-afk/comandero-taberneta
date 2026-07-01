"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getMenuDia,
  guardarMenuDia,
  resetMenuDia,
} from "@/lib/storage/menu-dia";
import type { MenuDiaConfig } from "@/types/menu-dia";

export function useMenuDia() {
  const [menu, setMenu] = useState<MenuDiaConfig | null>(null);

  const recargar = useCallback(() => {
    setMenu(getMenuDia());
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const guardar = useCallback(
    (config: MenuDiaConfig) => {
      guardarMenuDia(config);
      recargar();
    },
    [recargar],
  );

  const actualizar = useCallback(
    (cambios: Partial<MenuDiaConfig>) => {
      const actual = getMenuDia();
      guardar({ ...actual, ...cambios });
    },
    [guardar],
  );

  const restaurarDefault = useCallback(() => {
    setMenu(resetMenuDia());
  }, []);

  return {
    menu,
    recargar,
    guardar,
    actualizar,
    restaurarDefault,
  };
}
