export type SeccionCatalogo =
  | "entrantes"
  | "primeros"
  | "segundos"
  | "bebidas"
  | "postres"
  | "extras"
  | "salsas";

export type TipoProducto = "carta" | "menu-dia" | "ambos";

/** Carta a la que pertenece el producto */
export type CartaServicio = "almuerzo" | "cenas" | "bebidas" | "postres";

/** Uso en la pantalla de nueva comanda */
export type UsoComanda =
  | "entrantes"
  | "primeros"
  | "segundos"
  | "bebidas"
  | "postres"
  | "extras";

/** Categoría dentro de cada carta (admin) */
export type CategoriaCarta =
  | "tapas"
  | "hamburguesas"
  | "carnesGuisadas"
  | "carnesBrasa"
  | "ensaladas"
  | "infantil"
  | "bocadillosCalientes"
  | "bocadillosFrios"
  | "torradas"
  | "platosCombinados"
  | "extrasSuplementos"
  | "tapasYRaciones"
  | "brasa"
  | "blancos"
  | "tintos"
  | "rosados"
  | "cavas"
  | "corpinnats"
  | "refrescos"
  | "postres";

export const CARTAS_SERVICIO: {
  id: CartaServicio;
  label: string;
  disponible: boolean;
}[] = [
  { id: "almuerzo", label: "Carta almuerzo", disponible: true },
  { id: "bebidas", label: "Vinos y bebidas", disponible: true },
  { id: "postres", label: "Postres", disponible: true },
  { id: "cenas", label: "Carta cenas", disponible: true },
];

export const CATEGORIAS_CARTA: Record<
  CartaServicio,
  { id: CategoriaCarta; label: string }[]
> = {
  almuerzo: [
    { id: "tapas", label: "Tapas" },
    { id: "hamburguesas", label: "Hamburguesas" },
    { id: "carnesGuisadas", label: "Carnes guisadas" },
    { id: "carnesBrasa", label: "Carnes a la brasa" },
    { id: "ensaladas", label: "Ensaladas" },
    { id: "infantil", label: "Infantil" },
    { id: "bocadillosCalientes", label: "Bocadillos calientes" },
    { id: "bocadillosFrios", label: "Bocadillos fríos" },
    { id: "torradas", label: "Torradas" },
    { id: "platosCombinados", label: "Platos combinados" },
    { id: "extrasSuplementos", label: "Extras y suplementos" },
  ],
  cenas: [
    { id: "tapasYRaciones", label: "Tapas y raciones" },
    { id: "hamburguesas", label: "Hamburguesas" },
    { id: "torradas", label: "Torradas" },
    { id: "brasa", label: "Brasa" },
  ],
  bebidas: [
    { id: "blancos", label: "Blancos" },
    { id: "tintos", label: "Tintos" },
    { id: "rosados", label: "Rosados" },
    { id: "cavas", label: "Cavas" },
    { id: "corpinnats", label: "Corpinnats" },
    { id: "refrescos", label: "Refrescos y cervezas" },
  ],
  postres: [{ id: "postres", label: "Postres" }],
};

export function labelCategoriaCarta(
  carta: CartaServicio,
  categoria: CategoriaCarta,
): string {
  return (
    CATEGORIAS_CARTA[carta].find((c) => c.id === categoria)?.label ?? categoria
  );
}

export type AlergenoId =
  | "gluten"
  | "lactosa"
  | "huevo"
  | "frutos-secos"
  | "pescado"
  | "marisco"
  | "soja"
  | "mostaza"
  | "apio"
  | "sulfitos"
  | "sesamo";

export interface ProductoCatalogo {
  id: string;
  nombre: string;
  nombreCorto?: string;
  seccion: SeccionCatalogo;
  tipo: TipoProducto;
  /** Carta de servicio (almuerzo, cenas, bebidas, postres) */
  cartaServicio?: CartaServicio;
  /** Categoría dentro de la carta (tapas, vinos, etc.) */
  categoriaCarta?: CategoriaCarta;
  /** Secciones de comanda donde aparece el producto */
  usosComanda?: UsoComanda[];
  /** @deprecated Usar precioCarta — se mantiene por compatibilidad */
  precio?: number;
  precioCarta?: number;
  precioMenu?: number;
  suplemento?: number;
  activo: boolean;
  agotado: boolean;
  favorito: boolean;
  orden: number;
  descripcionCamarero?: string;
  ingredientes: string[];
  alergenos: AlergenoId[];
  notasInternas?: string;
  tiempoPreparacion?: number;
  recomendado: boolean;
}

export const SECCIONES_CATALOGO: {
  id: SeccionCatalogo;
  label: string;
}[] = [
  { id: "entrantes", label: "Entrantes" },
  { id: "primeros", label: "Primeros" },
  { id: "segundos", label: "Segundos" },
  { id: "bebidas", label: "Bebidas" },
  { id: "postres", label: "Postres" },
  { id: "extras", label: "Extras" },
  { id: "salsas", label: "Salsas" },
];

export const TIPOS_PRODUCTO: { id: TipoProducto; label: string }[] = [
  { id: "carta", label: "Carta" },
  { id: "menu-dia", label: "Menú del día" },
  { id: "ambos", label: "Carta y menú" },
];

export const ALERGENOS: { id: AlergenoId; label: string }[] = [
  { id: "gluten", label: "Gluten" },
  { id: "lactosa", label: "Lactosa" },
  { id: "huevo", label: "Huevo" },
  { id: "frutos-secos", label: "Frutos secos" },
  { id: "pescado", label: "Pescado" },
  { id: "marisco", label: "Marisco" },
  { id: "soja", label: "Soja" },
  { id: "mostaza", label: "Mostaza" },
  { id: "apio", label: "Apio" },
  { id: "sulfitos", label: "Sulfitos" },
  { id: "sesamo", label: "Sésamo" },
];

export function labelSeccion(seccion: SeccionCatalogo): string {
  return SECCIONES_CATALOGO.find((s) => s.id === seccion)?.label ?? seccion;
}

export function labelAlergeno(id: AlergenoId): string {
  return ALERGENOS.find((a) => a.id === id)?.label ?? id;
}

export function labelTipoProducto(tipo: TipoProducto): string {
  return TIPOS_PRODUCTO.find((t) => t.id === tipo)?.label ?? tipo;
}

export function nombreBoton(producto: ProductoCatalogo): string {
  return producto.nombreCorto?.trim() || producto.nombre;
}

export function precioCartaDe(producto: ProductoCatalogo): number | undefined {
  const v = producto.precioCarta ?? producto.precio;
  return v && v > 0 ? v : undefined;
}
