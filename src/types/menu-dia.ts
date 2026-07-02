/** Configuración del menú del día — preparado para migrar a Supabase */
export interface PlatoMenuDiaImportado {
  id: string;
  nombre: string;
  suplemento?: number;
  /** Producto de carta si hubo coincidencia al importar */
  productoId?: string;
}

export interface MenuDiaConfig {
  fecha: string;
  precioMenu: number;
  primerosIds: string[];
  segundosIds: string[];
  /** Platos leídos del PDF del día (nombres exactos para comandas) */
  primerosImportados?: PlatoMenuDiaImportado[];
  segundosImportados?: PlatoMenuDiaImportado[];
  suplementoPrimeros?: number;
  suplementoSegundos?: number;
  postresIncluidosIds: string[];
  observaciones?: string;
  activo: boolean;
}

export const MENU_DIA_DEFAULT: MenuDiaConfig = {
  fecha: new Date().toISOString().slice(0, 10),
  precioMenu: 14,
  primerosIds: [],
  segundosIds: [],
  postresIncluidosIds: [],
  observaciones: "",
  activo: false,
};
