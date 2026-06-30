import {
  actualizarUsuario,
  crearUsuario,
  getUsuario,
  getUsuarios,
  registrarUltimoAcceso,
  resetUsuarios,
} from "@/lib/storage/usuarios";
import type { UsuariosRepository } from "@/lib/auth/usuarios-repository";
import type { Usuario, UsuarioInput } from "@/types/auth";

/** Implementación localStorage — reemplazar por SupabaseUsuariosRepository */
export const usuariosRepositoryLocal: UsuariosRepository = {
  getAll: getUsuarios,
  getByUsername: getUsuario,
  crear: crearUsuario,
  actualizar: actualizarUsuario,
  registrarAcceso: registrarUltimoAcceso,
  restaurarIniciales: resetUsuarios,
};

let repo: UsuariosRepository = usuariosRepositoryLocal;

export function getUsuariosRepository(): UsuariosRepository {
  return repo;
}

/** Para tests o futura inyección de Supabase */
export function setUsuariosRepository(nuevo: UsuariosRepository): void {
  repo = nuevo;
}

export function registrarAccesoUsuario(username: string): void {
  getUsuariosRepository().registrarAcceso(username);
}

export type { Usuario, UsuarioInput };
