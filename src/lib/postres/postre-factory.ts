import { createId } from "@/lib/id/create-id";
import { normalizarPostreFormItem } from "@/lib/postres/normalize-form-item";
import type { PostreFormItem } from "@/types/postres";

export function crearPostreVacio(): PostreFormItem {
  return normalizarPostreFormItem(null);
}

export function duplicarPostre(postre: PostreFormItem): PostreFormItem {
  return {
    ...normalizarPostreFormItem(postre),
    id: createId(),
  };
}

export function postreTieneContenido(postre: PostreFormItem): boolean {
  return String(postre.nombre ?? "").trim().length > 0;
}
