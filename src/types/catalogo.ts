export type SeccionCatalogo =
  | "entrantes"
  | "primeros"
  | "segundos"
  | "bebidas"
  | "postres"
  | "extras"
  | "salsas";

export interface ProductoCatalogo {
  id: string;
  nombre: string;
  seccion: SeccionCatalogo;
  precio?: number;
  activo: boolean;
  suplemento?: number;
  favorito: boolean;
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

export function labelSeccion(seccion: SeccionCatalogo): string {
  return SECCIONES_CATALOGO.find((s) => s.id === seccion)?.label ?? seccion;
}
