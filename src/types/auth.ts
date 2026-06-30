export type Rol = "ADMIN" | "CAMARERO";

/** Usuario almacenado — preparado para migrar a Supabase */
export interface Usuario {
  username: string;
  password: string;
  rol: Rol;
  nombre: string;
  /** ID en la lista de camareros; null si el usuario no actúa como camarero fijo */
  camareroId: string | null;
  activo: boolean;
  ultimoAcceso: string | null;
  creadoEn: string;
}

export interface Sesion {
  username: string;
  rol: Rol;
  nombre: string;
  camareroId: string | null;
  iniciadaEn: string;
}

export type UsuarioInput = Pick<
  Usuario,
  "username" | "password" | "rol" | "nombre" | "camareroId" | "activo"
>;

export const ROLES: { id: Rol; label: string }[] = [
  { id: "ADMIN", label: "Administrador" },
  { id: "CAMARERO", label: "Camarero" },
];
