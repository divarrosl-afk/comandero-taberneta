export type Rol = "ADMIN" | "CAMARERO";

export interface Usuario {
  username: string;
  password: string;
  rol: Rol;
  nombre: string;
  /** ID en la lista de camareros; null si el usuario no actúa como camarero fijo */
  camareroId: string | null;
}

export interface Sesion {
  username: string;
  rol: Rol;
  nombre: string;
  camareroId: string | null;
  iniciadaEn: string;
}
