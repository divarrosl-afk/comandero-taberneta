import { createId } from "@/lib/id/create-id";
import type { CategoriaCarta, ProductoCatalogo } from "@/types/catalogo";

export type GrupoCafe = "cafe" | "carajillo" | "infusion";

export interface OpcionCafeRapida {
  id: string;
  grupo: GrupoCafe;
  label: string;
  /** Texto que sale en el ticket */
  etiquetaTicket: string;
}

export const OPCIONES_CAFE: OpcionCafeRapida[] = [
  { id: "c-solo", grupo: "cafe", label: "Café solo", etiquetaTicket: "C" },
  { id: "c-largo", grupo: "cafe", label: "Café solo largo", etiquetaTicket: "C largo" },
  { id: "c-hielo", grupo: "cafe", label: "Café solo + hielo", etiquetaTicket: "C+H" },
  { id: "c-leche", grupo: "cafe", label: "Café con leche", etiquetaTicket: "C/L" },
  {
    id: "cl-h",
    grupo: "cafe",
    label: "Café con leche + hielo",
    etiquetaTicket: "C/L + H",
  },
  { id: "cortado", grupo: "cafe", label: "Cortado", etiquetaTicket: "Ç" },
  { id: "cortado-nat", grupo: "cafe", label: "Cortado natural", etiquetaTicket: "Ç NAT" },
  {
    id: "cortado-largo",
    grupo: "cafe",
    label: "Cortado largo",
    etiquetaTicket: "Ç largo",
  },
];

export const SABORES_CARAJILLO = [
  "manzanilla",
  "menta poleo",
  "frutos rojos",
  "chupito de licor",
] as const;

export const INFUSIONES = [
  "manzanilla",
  "menta poleo",
  "frutos rojos",
  "té verde",
] as const;

const CATEGORIA_POR_GRUPO: Record<GrupoCafe, CategoriaCarta> = {
  cafe: "cafes",
  carajillo: "carajillos",
  infusion: "infusiones",
};

export function etiquetaCarajillo(sabor: string): string {
  return `CARAJ DE ${sabor}`;
}

export function opcionesCafePorGrupo(grupo: GrupoCafe): OpcionCafeRapida[] {
  return OPCIONES_CAFE.filter((o) => o.grupo === grupo);
}

function crearProductoCafeCatalogo(
  categoriaCarta: CategoriaCarta,
  nombre: string,
  etiquetaTicket: string,
  orden: number,
): ProductoCatalogo {
  return {
    id: createId(),
    nombre,
    nombreCorto:
      etiquetaTicket.trim() !== nombre.trim() ? etiquetaTicket.trim() : undefined,
    seccion: "postres",
    tipo: "carta",
    cartaServicio: "postres",
    categoriaCarta,
    usosComanda: [],
    activo: true,
    agotado: false,
    favorito: false,
    orden,
    ingredientes: [],
    alergenos: [],
    recomendado: false,
  };
}

/** Productos de cafés/carajillos/infusiones para el catálogo editable por admin. */
export function crearProductosCafesCatalogo(): ProductoCatalogo[] {
  const cafes = OPCIONES_CAFE.map((opcion, i) =>
    crearProductoCafeCatalogo(
      CATEGORIA_POR_GRUPO[opcion.grupo],
      opcion.label,
      opcion.etiquetaTicket,
      (i + 1) * 10,
    ),
  );

  const carajillos = SABORES_CARAJILLO.map((sabor, i) =>
    crearProductoCafeCatalogo(
      "carajillos",
      sabor,
      etiquetaCarajillo(sabor),
      100 + i * 10,
    ),
  );

  const infusiones = INFUSIONES.map((nombre, i) =>
    crearProductoCafeCatalogo("infusiones", nombre, nombre, 200 + i * 10),
  );

  return [...cafes, ...carajillos, ...infusiones];
}

export function etiquetaTicketDeProductoCafe(producto: ProductoCatalogo): string {
  if (producto.nombreCorto?.trim()) return producto.nombreCorto.trim();
  if (producto.categoriaCarta === "carajillos") {
    return etiquetaCarajillo(producto.nombre);
  }
  return producto.nombre;
}

export function esProductoCafeCatalogo(producto: ProductoCatalogo): boolean {
  return (
    producto.categoriaCarta === "cafes" ||
    producto.categoriaCarta === "carajillos" ||
    producto.categoriaCarta === "infusiones"
  );
}

export const CATEGORIAS_CAFE_CATALOGO: {
  id: CategoriaCarta;
  label: string;
}[] = [
  { id: "cafes", label: "Cafés" },
  { id: "carajillos", label: "Carajillos" },
  { id: "infusiones", label: "Infusiones" },
];
