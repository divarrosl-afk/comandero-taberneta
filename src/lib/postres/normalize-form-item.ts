import { createId } from "@/lib/id/create-id";
import type { PostreFormItem } from "@/types/postres";

export function normalizarPostreFormItem(
  raw: Partial<PostreFormItem> | null | undefined,
): PostreFormItem {
  return {
    id: typeof raw?.id === "string" && raw.id.trim() ? raw.id.trim() : createId(),
    nombre: typeof raw?.nombre === "string" ? raw.nombre : "",
    cantidad:
      typeof raw?.cantidad === "number" && raw.cantidad > 0
        ? Math.round(raw.cantidad)
        : 1,
    nota: typeof raw?.nota === "string" ? raw.nota : undefined,
  };
}

export function normalizarListaPostreForm(
  items: Partial<PostreFormItem>[] | null | undefined,
): PostreFormItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    return [normalizarPostreFormItem(null)];
  }
  return items.map((item) => normalizarPostreFormItem(item));
}
