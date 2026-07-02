import {
  decodeProductoMeta,
} from "@/lib/carta/carta-servicio-meta";
import { createId } from "@/lib/id/create-id";
import type {
  CartaServicio,
  CategoriaCarta,
  ProductoCatalogo,
  SeccionCatalogo,
  TipoProducto,
  UsoComanda,
} from "@/types/catalogo";

function inferirTipo(
  seccion: SeccionCatalogo,
  suplemento?: number,
  tipo?: TipoProducto,
): TipoProducto {
  if (tipo) return tipo;
  if (seccion === "extras" || seccion === "salsas" || seccion === "bebidas") {
    return "carta";
  }
  if (suplemento && suplemento > 0) return "menu-dia";
  return "ambos";
}

function inferirCartaServicio(
  seccion: SeccionCatalogo,
  cartaServicio?: CartaServicio,
): CartaServicio | undefined {
  if (cartaServicio) return cartaServicio;
  if (seccion === "bebidas") return "bebidas";
  if (seccion === "postres") return "postres";
  if (seccion === "extras" || seccion === "salsas") return "almuerzo";
  return undefined;
}

function inferirUsosComanda(
  seccion: SeccionCatalogo,
  usos?: UsoComanda[],
): UsoComanda[] | undefined {
  if (usos?.length) return usos;
  if (seccion === "entrantes") return ["entrantes"];
  if (seccion === "primeros") return ["primeros"];
  if (seccion === "segundos") return ["segundos"];
  if (seccion === "bebidas") return ["bebidas"];
  if (seccion === "postres") return ["postres"];
  if (seccion === "extras" || seccion === "salsas") return ["extras"];
  return undefined;
}

/** Migra productos antiguos al esquema ampliado sin perder datos */
export function migrarProducto(raw: Partial<ProductoCatalogo>): ProductoCatalogo {
  const seccion = raw.seccion ?? "entrantes";
  const precioCarta =
    raw.precioCarta && raw.precioCarta > 0
      ? raw.precioCarta
      : raw.precio && raw.precio > 0
        ? raw.precio
        : undefined;

  const suplemento =
    raw.suplemento && raw.suplemento > 0 ? raw.suplemento : undefined;

  const tipo = inferirTipo(seccion, suplemento, raw.tipo);
  const decoded = decodeProductoMeta(raw.notasInternas);
  const cartaServicio = inferirCartaServicio(
    seccion,
    raw.cartaServicio ?? decoded.meta.cartaServicio,
  );
  const usosComanda = inferirUsosComanda(
    seccion,
    raw.usosComanda ?? decoded.meta.usosComanda,
  );

  return {
    id: raw.id ?? createId(),
    nombre: (raw.nombre ?? "").trim(),
    nombreCorto: raw.nombreCorto?.trim() || undefined,
    seccion,
    tipo,
    cartaServicio,
    categoriaCarta: raw.categoriaCarta ?? decoded.meta.categoriaCarta,
    usosComanda,
    precio: precioCarta,
    precioCarta,
    precioMenu: raw.precioMenu && raw.precioMenu > 0 ? raw.precioMenu : undefined,
    suplemento,
    activo: raw.activo ?? true,
    agotado: raw.agotado ?? false,
    favorito: raw.favorito ?? false,
    orden: raw.orden ?? 0,
    descripcionCamarero: raw.descripcionCamarero?.trim() || undefined,
    ingredientes: Array.isArray(raw.ingredientes) ? raw.ingredientes : [],
    alergenos: Array.isArray(raw.alergenos) ? raw.alergenos : [],
    notasInternas: decoded.notasLimpias?.trim() || undefined,
    tiempoPreparacion:
      raw.tiempoPreparacion && raw.tiempoPreparacion > 0
        ? raw.tiempoPreparacion
        : undefined,
    recomendado: raw.recomendado ?? false,
  };
}
