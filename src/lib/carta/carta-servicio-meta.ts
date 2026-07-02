import type { CartaServicio } from "@/types/catalogo";

const PREFIX = "__cs:";
const SUFFIX = "__";

export function decodeCartaServicio(notas?: string): {
  cartaServicio?: CartaServicio;
  notasLimpias?: string;
} {
  if (!notas?.startsWith(PREFIX)) {
    return { notasLimpias: notas };
  }

  const end = notas.indexOf(SUFFIX, PREFIX.length);
  if (end === -1) {
    return { notasLimpias: notas };
  }

  const cartaServicio = notas.slice(PREFIX.length, end) as CartaServicio;
  const rest = notas.slice(end + SUFFIX.length).trim() || undefined;
  return { cartaServicio, notasLimpias: rest };
}

export function encodeCartaServicioMeta(
  cartaServicio?: CartaServicio,
  notasInternas?: string,
): string | undefined {
  const parts: string[] = [];
  if (cartaServicio) {
    parts.push(`${PREFIX}${cartaServicio}${SUFFIX}`);
  }
  if (notasInternas?.trim()) {
    parts.push(notasInternas.trim());
  }
  return parts.length > 0 ? parts.join(" ") : undefined;
}
