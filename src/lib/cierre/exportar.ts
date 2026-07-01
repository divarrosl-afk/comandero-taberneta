import {
  getComandasCocinaFiltradas,
  getComandasPostresFiltradas,
} from "@/lib/cierre/filtros";
import { getCatalogo } from "@/lib/storage/catalogo";
import { getImpresoraConfig } from "@/lib/storage/impresora-config";
import { getMenuDia } from "@/lib/storage/menu-dia";
import type { Sesion } from "@/types/auth";
import {
  FILTRO_TODOS_CAMARERO,
  type FiltrosCierre,
} from "@/types/cierre";
import type { ComandaCocina } from "@/types/comanda";
import type { ProductoCatalogo } from "@/types/catalogo";
import type { ImpresoraConfig } from "@/types/impresora";
import type { MenuDiaConfig } from "@/types/menu-dia";
import type { ComandaPostres } from "@/types/postres";

export const EXPORT_VERSION = "1.0";

export interface ExportacionCierre {
  version: string;
  exportadoEn: string;
  exportadoPor: {
    username: string;
    nombre: string;
    rol: string;
  };
  fecha: string;
  comandasCocina: ComandaCocina[];
  comandasPostres: ComandaPostres[];
  carta: ProductoCatalogo[];
  menuDia: MenuDiaConfig;
  impresora: ImpresoraConfig;
}

export interface ResumenExportacion {
  fecha: string;
  totalCocina: number;
  totalPostres: number;
  totalTickets: number;
  productosCarta: number;
  menuActivo: boolean;
  impresoraNombre: string;
  exportadoPor: string;
  tamanoAproxKb: number;
}

export function generarExportacionCierre(
  fecha: string,
  sesion: Sesion,
): ExportacionCierre {
  const filtrosDia: FiltrosCierre = {
    fecha,
    camarero: FILTRO_TODOS_CAMARERO,
    mesa: null,
    tipo: "todos",
    estado: "todos",
  };

  return {
    version: EXPORT_VERSION,
    exportadoEn: new Date().toISOString(),
    exportadoPor: {
      username: sesion.username,
      nombre: sesion.nombre,
      rol: sesion.rol,
    },
    fecha,
    comandasCocina: getComandasCocinaFiltradas(filtrosDia),
    comandasPostres: getComandasPostresFiltradas(filtrosDia),
    carta: getCatalogo(),
    menuDia: getMenuDia(),
    impresora: getImpresoraConfig(),
  };
}

export function resumenExportacion(
  datos: ExportacionCierre,
): ResumenExportacion {
  const json = JSON.stringify(datos);
  return {
    fecha: datos.fecha,
    totalCocina: datos.comandasCocina.length,
    totalPostres: datos.comandasPostres.length,
    totalTickets: datos.comandasCocina.length + datos.comandasPostres.length,
    productosCarta: datos.carta.length,
    menuActivo: datos.menuDia.activo,
    impresoraNombre: datos.impresora.nombre,
    exportadoPor: datos.exportadoPor.nombre,
    tamanoAproxKb: Math.round((json.length / 1024) * 10) / 10,
  };
}

export function nombreArchivoExportacion(fecha: string): string {
  return `cierre-taberneta-${fecha}.json`;
}

export function descargarExportacionCierre(datos: ExportacionCierre): void {
  const blob = new Blob([JSON.stringify(datos, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivoExportacion(datos.fecha);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
