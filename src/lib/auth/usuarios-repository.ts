import type { Usuario, UsuarioInput } from "@/types/auth";

/** Capa de acceso a usuarios — sustituir implementación por Supabase en el futuro */
export interface UsuariosRepository {
  getAll(): Usuario[];
  getByUsername(username: string): Usuario | undefined;
  crear(input: UsuarioInput): Usuario;
  actualizar(username: string, cambios: Partial<Usuario>): Usuario | null;
  registrarAcceso(username: string): void;
  restaurarIniciales(): Usuario[];
}
