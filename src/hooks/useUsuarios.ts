"use client";

import { useCallback, useEffect, useState } from "react";
import { getUsuariosRepository } from "@/lib/data/data-layer";
import type { Usuario, UsuarioInput } from "@/types/auth";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      setUsuarios(await getUsuariosRepository().getAll());
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const crear = useCallback(
    async (input: UsuarioInput) => {
      const usuario = await getUsuariosRepository().crear(input);
      await recargar();
      return usuario;
    },
    [recargar],
  );

  const actualizar = useCallback(
    async (username: string, cambios: Partial<Usuario>) => {
      const usuario = await getUsuariosRepository().actualizar(
        username,
        cambios,
      );
      await recargar();
      return usuario;
    },
    [recargar],
  );

  const puedeDesactivar = useCallback(
    (username: string): boolean => {
      const key = username.trim().toLowerCase();
      const u = usuarios.find((x) => x.username === key);
      if (!u) return false;
      if (u.rol === "ADMIN" && u.activo) {
        const otrosAdmins = usuarios.filter(
          (x) =>
            x.rol === "ADMIN" && x.activo && x.username !== key,
        );
        if (otrosAdmins.length === 0) return false;
      }
      return true;
    },
    [usuarios],
  );

  const eliminar = useCallback(
    async (username: string) => {
      const ok = await getUsuariosRepository().eliminar(username);
      await recargar();
      return ok;
    },
    [recargar],
  );

  return {
    usuarios,
    cargando,
    recargar,
    crear,
    actualizar,
    eliminar,
    puedeDesactivar,
  };
}
