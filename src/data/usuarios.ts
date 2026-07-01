import type { Usuario } from "@/types/auth";

/** Usuarios iniciales — solo modo local (localStorage). No usar en Supabase Auth. */
export const usuariosIniciales: Usuario[] = [
  {
    username: "divarro",
    password: "admin",
    rol: "ADMIN",
    nombre: "Divarro",
    camareroId: null,
    activo: true,
    ultimoAcceso: null,
    creadoEn: new Date().toISOString(),
  },
  {
    username: "david",
    password: "camarero",
    rol: "CAMARERO",
    nombre: "David",
    camareroId: "david",
    activo: true,
    ultimoAcceso: null,
    creadoEn: new Date().toISOString(),
  },
  {
    username: "ingrid",
    password: "camarero",
    rol: "CAMARERO",
    nombre: "Ingrid",
    camareroId: "ingrid",
    activo: true,
    ultimoAcceso: null,
    creadoEn: new Date().toISOString(),
  },
  {
    username: "cocina",
    password: "camarero",
    rol: "CAMARERO",
    nombre: "Cocina",
    camareroId: "cocina",
    activo: true,
    ultimoAcceso: null,
    creadoEn: new Date().toISOString(),
  },
];
