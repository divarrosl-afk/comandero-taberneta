"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppSync } from "@/hooks/useAppSync";
import {
  getMenuDia,
  guardarMenuDia,
  quitarMenuDia,
} from "@/lib/menu-dia/menu-dia-service";
import type { MenuDiaConfig } from "@/types/menu-dia";

export function useMenuDia() {
  const [menu, setMenu] = useState<MenuDiaConfig | null>(null);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      setMenu(await getMenuDia());
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  useAppSync(() => {
    void recargar();
  });

  const guardar = useCallback(
    async (config: MenuDiaConfig) => {
      await guardarMenuDia(config);
      await recargar();
    },
    [recargar],
  );

  const actualizar = useCallback(
    async (cambios: Partial<MenuDiaConfig>) => {
      const actual = await getMenuDia();
      await guardar({ ...actual, ...cambios });
    },
    [guardar],
  );

  const quitar = useCallback(async () => {
    const config = await quitarMenuDia();
    setMenu(config);
  }, []);

  const restaurarDefault = useCallback(async () => {
    await quitar();
  }, [quitar]);

  return {
    menu,
    cargando,
    recargar,
    guardar,
    actualizar,
    quitar,
    restaurarDefault,
  };
}
