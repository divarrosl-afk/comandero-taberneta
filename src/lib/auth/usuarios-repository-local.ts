import {
  actualizarUsuario,
  contarAdminsActivos,
  crearUsuario,
  eliminarUsuario,
  getUsuario,
  getUsuarios,
  registrarUltimoAcceso,
  resetUsuarios,
} from "@/lib/storage/usuarios";
import type { UsuariosRepository } from "@/lib/auth/usuarios-repository";
import type { Usuario, UsuarioInput } from "@/types/auth";

export const usuariosRepositoryLocal: UsuariosRepository = {
  getAll: async () => getUsuarios(),
  getByUsername: async (username) => getUsuario(username),
  crear: async (input) => crearUsuario(input),
  actualizar: async (username, cambios) =>
    actualizarUsuario(username, cambios),
  eliminar: async (username) => eliminarUsuario(username),
  registrarAcceso: async (username) => registrarUltimoAcceso(username),
  restaurarIniciales: async () => resetUsuarios(),
  contarAdminsActivos: async (excluir) => contarAdminsActivos(excluir),
};
