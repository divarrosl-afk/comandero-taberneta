"use client";

import { useCallback, useEffect, useState } from "react";
import { contarAdminsActivos } from "@/lib/storage/usuarios";
import { getUsuariosRepository } from "@/lib/auth/usuarios-service";
import type { Usuario, UsuarioInput } from "@/types/auth";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const recargar = useCallback(() => {
    setUsuarios(getUsuariosRepository().getAll());
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crear = useCallback(
    (input: UsuarioInput) => {
      const usuario = getUsuariosRepository().crear(input);
      recargar();
      return usuario;
    },
    [recargar],
  );

  const actualizar = useCallback(
    (username: string, cambios: Partial<Usuario>) => {
      const usuario = getUsuariosRepository().actualizar(username, cambios);
      recargar();
      return usuario;
    },
    [recargar],
  );

  const puedeDesactivar = useCallback((username: string): boolean => {
    const u = getUsuariosRepository().getByUsername(username);
    if (!u) return false;
    if (u.rol === "ADMIN" && u.activo && contarAdminsActivos(username) === 0) {
      return false;
    }
    return true;
  }, []);

  return {
    usuarios,
    recargar,
    crear,
    actualizar,
    puedeDesactivar,
  };
}
