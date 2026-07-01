export type SeccionCatalogo =
  | "entrantes"
  | "primeros"
  | "segundos"
  | "bebidas"
  | "postres"
  | "extras"
  | "salsas";

export type TipoProducto = "carta" | "menu-dia" | "ambos";

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
