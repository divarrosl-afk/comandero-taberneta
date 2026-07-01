import { createId } from "@/lib/id/create-id";
import type { PostreFormItem } from "@/types/postres";

export function crearPostreVacio(): PostreFormItem {
  return {
    id: createId(),
    nombre: "",
    cantidad: 1,
  };
}

export function duplicarPostre(postre: PostreFormItem): PostreFormItem {
  return {
    ...postre,
    id: createId(),
  };
}

export function postreTieneContenido(postre: PostreFormItem): boolean {
  return postre.nombre.trim().length > 0;
}
