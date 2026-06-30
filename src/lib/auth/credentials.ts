import { usuariosIniciales } from "@/data/usuarios";
import type { Sesion, Usuario } from "@/types/auth";

export function buscarUsuario(
  username: string,
  password: string,
): Usuario | null {
  const normalizado = username.trim().toLowerCase();
  return (
    usuariosIniciales.find(
      (u) =>
        u.username.toLowerCase() === normalizado && u.password === password,
    ) ?? null
  );
}

export function usuarioASesion(usuario: Usuario): Sesion {
  return {
    username: usuario.username,
    rol: usuario.rol,
    nombre: usuario.nombre,
    camareroId: usuario.camareroId,
    iniciadaEn: new Date().toISOString(),
  };
}
