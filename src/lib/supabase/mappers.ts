import { encodeProductoMeta } from "@/lib/carta/carta-servicio-meta";
import { migrarProducto } from "@/lib/carta/migrate-producto";
import type { ProductoCatalogo } from "@/types/catalogo";
import type { MenuDiaConfig } from "@/types/menu-dia";
import type { MesaConfig } from "@/types/mesas";
import type { Rol, Sesion } from "@/types/auth";
import type { ImpresoraConfig } from "@/types/impresora";

export interface DbPerfil {
  id: string;
  auth_user_id: string | null;
  restaurante_id: string;
  username: string;
  nombre: string;
  rol: Rol;
  camarero_id: string | null;
  activo: boolean;
  ultimo_acceso: string | null;
  created_at: string;
}

export interface DbProducto {
  id: string;
  restaurante_id: string;
  nombre: string;
  nombre_corto: string | null;
  seccion: ProductoCatalogo["seccion"];
  tipo: ProductoCatalogo["tipo"];
  precio_carta: number | null;
  precio_menu: number | null;
  suplemento: number | null;
  activo: boolean;
  agotado: boolean;
  favorito: boolean;
  recomendado: boolean;
  orden: number;
  descripcion_camarero: string | null;
  ingredientes: string[];
  alergenos: ProductoCatalogo["alergenos"];
  notas_internas: string | null;
  tiempo_preparacion: number | null;
}

export interface DbMesa {
  id: string;
  restaurante_id: string;
  codigo: string;
  nombre_visible: string;
  zona: MesaConfig["zona"];
  activa: boolean;
  orden: number;
  permite_variante_b: boolean;
  es_variante_b: boolean;
  mesa_principal_id: string | null;
}

export interface DbMenuDia {
  id: string;
  restaurante_id: string;
  fecha: string;
  precio_menu: number;
  primeros_ids: string[];
  segundos_ids: string[];
  postres_incluidos_ids: string[];
  suplemento_primeros: number | null;
  suplemento_segundos: number | null;
  observaciones: string | null;
  activo: boolean;
}

export interface DbConfigImpresora {
  restaurante_id: string;
  nombre: string;
  ip: string;
  puerto: number;
  ancho_papel: ImpresoraConfig["anchoPapel"];
  activa: boolean;
  modo: ImpresoraConfig["modo"];
}

export function perfilToSesion(perfil: DbPerfil): Sesion {
  return {
    username: perfil.username,
    rol: perfil.rol,
    nombre: perfil.nombre,
    camareroId: perfil.camarero_id,
    iniciadaEn: new Date().toISOString(),
  };
}

export function perfilToUsuario(perfil: DbPerfil): {
  username: string;
  password: string;
  rol: Rol;
  nombre: string;
  camareroId: string | null;
  activo: boolean;
  ultimoAcceso: string | null;
  creadoEn: string;
} {
  return {
    username: perfil.username,
    password: "",
    rol: perfil.rol,
    nombre: perfil.nombre,
    camareroId: perfil.camarero_id,
    activo: perfil.activo,
    ultimoAcceso: perfil.ultimo_acceso,
    creadoEn: perfil.created_at,
  };
}

export function rowToProducto(row: DbProducto): ProductoCatalogo {
  return migrarProducto({
    id: row.id,
    nombre: row.nombre,
    nombreCorto: row.nombre_corto ?? undefined,
    seccion: row.seccion,
    tipo: row.tipo,
    precioCarta: row.precio_carta ?? undefined,
    precioMenu: row.precio_menu ?? undefined,
    suplemento: row.suplemento ?? undefined,
    activo: row.activo,
    agotado: row.agotado,
    favorito: row.favorito,
    recomendado: row.recomendado,
    orden: row.orden,
    descripcionCamarero: row.descripcion_camarero ?? undefined,
    ingredientes: row.ingredientes ?? [],
    alergenos: row.alergenos ?? [],
    notasInternas: row.notas_internas ?? undefined,
    tiempoPreparacion: row.tiempo_preparacion ?? undefined,
  });
}

export function productoToRow(
  producto: ProductoCatalogo,
  restauranteId: string,
): Omit<DbProducto, "restaurante_id"> & { restaurante_id: string } {
  const p = migrarProducto(producto);
  return {
    id: p.id,
    restaurante_id: restauranteId,
    nombre: p.nombre,
    nombre_corto: p.nombreCorto ?? null,
    seccion: p.seccion,
    tipo: p.tipo,
    precio_carta: p.precioCarta ?? p.precio ?? null,
    precio_menu: p.precioMenu ?? null,
    suplemento: p.suplemento ?? null,
    activo: p.activo,
    agotado: p.agotado,
    favorito: p.favorito,
    recomendado: p.recomendado,
    orden: p.orden,
    descripcion_camarero: p.descripcionCamarero ?? null,
    ingredientes: p.ingredientes,
    alergenos: p.alergenos,
    notas_internas:
      encodeProductoMeta(
        {
          cartaServicio: p.cartaServicio,
          categoriaCarta: p.categoriaCarta,
          usosComanda: p.usosComanda,
        },
        p.notasInternas,
      ) ?? null,
    tiempo_preparacion: p.tiempoPreparacion ?? null,
  };
}

export function rowToMesa(row: DbMesa): MesaConfig {
  return {
    id: row.id,
    codigo: row.codigo,
    nombreVisible: row.nombre_visible,
    zona: row.zona,
    activa: row.activa,
    orden: row.orden,
    permiteVarianteB: row.permite_variante_b,
    esVarianteB: row.es_variante_b,
    mesaPrincipalId: row.mesa_principal_id ?? undefined,
  };
}

export function mesaToRow(
  mesa: MesaConfig,
  restauranteId: string,
): Omit<DbMesa, "restaurante_id"> & { restaurante_id: string } {
  return {
    id: mesa.id,
    restaurante_id: restauranteId,
    codigo: mesa.codigo.trim().toUpperCase(),
    nombre_visible: mesa.nombreVisible.trim() || mesa.codigo,
    zona: mesa.zona,
    activa: mesa.activa,
    orden: Math.round(mesa.orden),
    permite_variante_b: mesa.permiteVarianteB,
    es_variante_b: mesa.esVarianteB,
    mesa_principal_id: mesa.mesaPrincipalId ?? null,
  };
}

export function rowToMenuDia(row: DbMenuDia): MenuDiaConfig {
  return {
    fecha: row.fecha,
    precioMenu: Number(row.precio_menu),
    primerosIds: row.primeros_ids ?? [],
    segundosIds: row.segundos_ids ?? [],
    postresIncluidosIds: row.postres_incluidos_ids ?? [],
    suplementoPrimeros: row.suplemento_primeros ?? undefined,
    suplementoSegundos: row.suplemento_segundos ?? undefined,
    observaciones: row.observaciones ?? undefined,
    activo: row.activo,
  };
}

export function menuDiaToRow(
  config: MenuDiaConfig,
  restauranteId: string,
): Omit<DbMenuDia, "id" | "restaurante_id"> & {
  restaurante_id: string;
} {
  return {
    restaurante_id: restauranteId,
    fecha: config.fecha,
    precio_menu: config.precioMenu,
    primeros_ids: config.primerosIds,
    segundos_ids: config.segundosIds,
    postres_incluidos_ids: config.postresIncluidosIds,
    suplemento_primeros: config.suplementoPrimeros ?? null,
    suplemento_segundos: config.suplementoSegundos ?? null,
    observaciones: config.observaciones ?? null,
    activo: config.activo,
  };
}

export function rowToImpresoraConfig(row: DbConfigImpresora): ImpresoraConfig {
  return {
    nombre: row.nombre,
    ip: row.ip,
    puerto: row.puerto,
    anchoPapel: row.ancho_papel,
    activa: row.activa,
    modo: row.modo,
  };
}

export function impresoraConfigToRow(
  config: ImpresoraConfig,
  restauranteId: string,
): DbConfigImpresora {
  return {
    restaurante_id: restauranteId,
    nombre: config.nombre,
    ip: config.ip,
    puerto: config.puerto,
    ancho_papel: config.anchoPapel,
    activa: config.activa,
    modo: config.modo,
  };
}
