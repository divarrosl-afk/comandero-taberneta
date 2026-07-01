import type { Usuario, UsuarioInput } from "@/types/auth";

/** Capa de acceso a usuarios */
export interface UsuariosRepository {
  getAll(): Promise<Usuario[]>;
  getByUsername(username: string): Promise<Usuario | undefined>;
  crear(input: UsuarioInput): Promise<Usuario>;
  actualizar(
    username: string,
    cambios: Partial<Usuario>,
  ): Promise<Usuario | null>;
  registrarAcceso(username: string): Promise<void>;
  restaurarIniciales(): Promise<Usuario[]>;
  contarAdminsActivos(excluir?: string): Promise<number>;
}
