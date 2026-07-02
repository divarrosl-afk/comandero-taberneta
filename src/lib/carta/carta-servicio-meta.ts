import type {
  CartaServicio,
  CategoriaCarta,
  UsoComanda,
} from "@/types/catalogo";

const PREFIX = "__meta:";
const SUFFIX = "__";

export type ProductoMeta = {
  cartaServicio?: CartaServicio;
  categoriaCarta?: CategoriaCarta;
  usosComanda?: UsoComanda[];
};

function parseMeta(raw: string): ProductoMeta {
  try {
    const params = new URLSearchParams(raw);
    const cartaServicio = params.get("cs") as CartaServicio | null;
    const categoriaCarta = params.get("cat") as CategoriaCarta | null;
    const usosRaw = params.get("uso");
    const usosComanda = usosRaw
      ? (usosRaw.split(",") as UsoComanda[])
      : undefined;
    return {
      cartaServicio: cartaServicio ?? undefined,
      categoriaCarta: categoriaCarta ?? undefined,
      usosComanda,
    };
  } catch {
    return {};
  }
}

export function decodeProductoMeta(notas?: string): {
  meta: ProductoMeta;
  notasLimpias?: string;
} {
  if (!notas?.startsWith(PREFIX)) {
    return { meta: {}, notasLimpias: notas };
  }

  const end = notas.indexOf(SUFFIX, PREFIX.length);
  if (end === -1) {
    return { meta: {}, notasLimpias: notas };
  }

  const meta = parseMeta(notas.slice(PREFIX.length, end));
  const rest = notas.slice(end + SUFFIX.length).trim() || undefined;
  return { meta, notasLimpias: rest };
}

/** @deprecated Usar decodeProductoMeta */
export function decodeCartaServicio(notas?: string): {
  cartaServicio?: CartaServicio;
  notasLimpias?: string;
} {
  const { meta, notasLimpias } = decodeProductoMeta(notas);
  return { cartaServicio: meta.cartaServicio, notasLimpias };
}

export function encodeProductoMeta(
  meta: ProductoMeta,
  notasInternas?: string,
): string | undefined {
  const params = new URLSearchParams();
  if (meta.cartaServicio) params.set("cs", meta.cartaServicio);
  if (meta.categoriaCarta) params.set("cat", meta.categoriaCarta);
  if (meta.usosComanda?.length) params.set("uso", meta.usosComanda.join(","));

  const parts: string[] = [];
  if ([...params.keys()].length > 0) {
    parts.push(`${PREFIX}${params.toString()}${SUFFIX}`);
  }
  if (notasInternas?.trim()) {
    parts.push(notasInternas.trim());
  }
  return parts.length > 0 ? parts.join(" ") : undefined;
}

/** @deprecated Usar encodeProductoMeta */
export function encodeCartaServicioMeta(
  cartaServicio?: CartaServicio,
  notasInternas?: string,
): string | undefined {
  return encodeProductoMeta({ cartaServicio }, notasInternas);
}
