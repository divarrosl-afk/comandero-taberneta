import type { PostreFormItem } from "@/types/postres";

export function crearPostreVacio(): PostreFormItem {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    cantidad: 1,
  };
}

export function duplicarPostre(postre: PostreFormItem): PostreFormItem {
  return {
    ...postre,
    id: crypto.randomUUID(),
  };
}

export function postreTieneContenido(postre: PostreFormItem): boolean {
  return postre.nombre.trim().length > 0;
}
