import type { Usuario } from "@/types/auth";

/** Usuarios locales de fase 1 — contraseñas en claro solo para entorno local */
export const usuariosIniciales: Usuario[] = [
  {
    username: "divarro",
    password: "admin",
    rol: "ADMIN",
    nombre: "Divarro",
    camareroId: null,
  },
  {
    username: "david",
    password: "camarero",
    rol: "CAMARERO",
    nombre: "David",
    camareroId: "david",
  },
  {
    username: "ingrid",
    password: "camarero",
    rol: "CAMARERO",
    nombre: "Ingrid",
    camareroId: "ingrid",
  },
  {
    username: "cocina",
    password: "camarero",
    rol: "CAMARERO",
    nombre: "Cocina",
    camareroId: "cocina",
  },
];
