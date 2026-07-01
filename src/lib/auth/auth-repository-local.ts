import { autenticarUsuario } from "@/lib/auth/credentials";
import type { AuthRepository } from "@/lib/auth/auth-repository";
import { getSesion, guardarSesion, limpiarSesion } from "@/lib/storage/sesion";

export const authRepositoryLocal: AuthRepository = {
  async login(username, password) {
    const sesion = autenticarUsuario(username, password);
    if (!sesion) return null;
    guardarSesion(sesion);
    return sesion;
  },

  async logout() {
    limpiarSesion();
  },

  async restoreSession() {
    return getSesion();
  },
};
