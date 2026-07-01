/** Configuración del menú del día — preparado para migrar a Supabase */
export interface MenuDiaConfig {
  fecha: string;
  precioMenu: number;
  primerosIds: string[];
  segundosIds: string[];
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
