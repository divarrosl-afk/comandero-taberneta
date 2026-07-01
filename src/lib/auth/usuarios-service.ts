import { getUsuariosRepository } from "@/lib/data/data-layer";
import type { Usuario, UsuarioInput } from "@/types/auth";

export function registrarAccesoUsuario(username: string): void {
  void getUsuariosRepository().registrarAcceso(username);
}

export type { Usuario, UsuarioInput };
