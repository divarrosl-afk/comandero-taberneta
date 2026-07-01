import { registrarAccesoUsuario } from "@/lib/auth/usuarios-service";
import { getUsuario } from "@/lib/storage/usuarios";
import type { Sesion, Usuario } from "@/types/auth";

export function buscarUsuario(
  username: string,
  password: string,
): Usuario | null {
  const normalizado = username.trim().toLowerCase();
  const usuario = getUsuario(normalizado);
  if (!usuario || !usuario.activo) return null;
  if (usuario.password !== password) return null;
  return usuario;
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

export function autenticarUsuario(
  username: string,
  password: string,
): Sesion | null {
  const usuario = buscarUsuario(username, password);
  if (!usuario) return null;
  registrarAccesoUsuario(usuario.username);
  return usuarioASesion(usuario);
}
