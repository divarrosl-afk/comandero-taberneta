import type {
  CartaServicio,
  CategoriaCarta,
  ProductoCatalogo,
  SeccionCatalogo,
  UsoComanda,
} from "@/types/catalogo";
import { CATEGORIAS_CARTA } from "@/types/catalogo";
import type { SeccionPlatos } from "@/types/comanda";

export function aUsoComanda(
  seccion: SeccionPlatos | SeccionCatalogo,
): UsoComanda {
  if (seccion === "salsas") return "extras";
  return seccion;
}

export function productoPerteneceACarta(
  producto: ProductoCatalogo,
  carta: CartaServicio,
): boolean {
  const servicio = producto.cartaServicio;
  if (carta === "almuerzo") {
    return servicio === "almuerzo";
  }
  if (carta === "bebidas") {
    return servicio === "bebidas";
  }
  if (carta === "postres") {
    return servicio === "postres";
  }
  return servicio === "cenas";
}

export function categoriasDeCarta(carta: CartaServicio) {
  return CATEGORIAS_CARTA[carta];
}

export function productoEnCategoria(
  producto: ProductoCatalogo,
  categoria: CategoriaCarta,
): boolean {
  return producto.categoriaCarta === categoria;
}

export function productoParaUsoComanda(
  producto: ProductoCatalogo,
  uso: UsoComanda,
): boolean {
  if (producto.usosComanda?.length) {
    return producto.usosComanda.includes(uso);
  }
  if (uso === "entrantes") return producto.seccion === "entrantes";
  if (uso === "primeros") return producto.seccion === "primeros";
  if (uso === "segundos") return producto.seccion === "segundos";
  if (uso === "bebidas") return producto.seccion === "bebidas";
  if (uso === "postres") return producto.seccion === "postres";
  if (uso === "extras") {
    return producto.seccion === "extras" || producto.seccion === "salsas";
  }
  return false;
}

export type OrigenPlatos = "menu" | "carta-almuerzo" | "carta-cenas";

export function origenACartaServicio(
  origen?: OrigenPlatos,
): CartaServicio | null {
  if (origen === "carta-almuerzo") return "almuerzo";
  if (origen === "carta-cenas") return "cenas";
  return null;
}

export function agruparProductosPorCategoria(
  productos: ProductoCatalogo[],
  carta: CartaServicio,
): { id: CategoriaCarta; label: string; productos: ProductoCatalogo[] }[] {
  const porCategoria = new Map<CategoriaCarta, ProductoCatalogo[]>();

  for (const producto of productos) {
    const cat = producto.categoriaCarta;
    if (!cat) continue;
    const lista = porCategoria.get(cat) ?? [];
    lista.push(producto);
    porCategoria.set(cat, lista);
  }

  return categoriasDeCarta(carta)
    .filter((c) => porCategoria.has(c.id))
    .map((c) => ({
      id: c.id,
      label: c.label,
      productos: (porCategoria.get(c.id) ?? []).sort(
        (a, b) =>
          a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"),
      ),
    }));
}

export function filtrarProductosComanda(
  productos: ProductoCatalogo[],
  opts: {
    uso: UsoComanda;
    origen?: OrigenPlatos;
    cartaServicio?: CartaServicio;
    categoriaCarta?: CategoriaCarta;
  },
): ProductoCatalogo[] {
  return productos.filter((p) => {
    if (!p.activo) return false;
    if (!productoParaUsoComanda(p, opts.uso)) return false;

    if (opts.categoriaCarta && p.categoriaCarta !== opts.categoriaCarta) {
      return false;
    }

    if (opts.origen === "menu") {
      return true;
    }

    if (opts.origen === "carta-almuerzo") {
      return (
        p.cartaServicio === "almuerzo" &&
        (p.tipo === "carta" || p.tipo === "ambos")
      );
    }

    if (opts.origen === "carta-cenas") {
      return p.cartaServicio === "cenas" && p.tipo === "carta";
    }

    if (opts.cartaServicio && p.cartaServicio !== opts.cartaServicio) {
      return false;
    }

    return true;
  });
}
