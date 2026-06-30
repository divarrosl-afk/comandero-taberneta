import type { Rol } from "@/types/auth";

export function esAdmin(rol: Rol): boolean {
  return rol === "ADMIN";
}

export function puedeAccederConfigCatalogo(rol: Rol): boolean {
  return esAdmin(rol);
}

export function puedeAccederConfigImpresora(rol: Rol): boolean {
  return esAdmin(rol);
}

export function puedeAccederConfigCarta(rol: Rol): boolean {
  return esAdmin(rol);
}

export function puedeAccederConfigMenuDia(rol: Rol): boolean {
  return esAdmin(rol);
}

export function puedeConsultarCarta(rol: Rol): boolean {
  return rol === "ADMIN" || rol === "CAMARERO";
}

export function puedeEditarCatalogo(rol: Rol): boolean {
  return esAdmin(rol);
}

export function puedeEditarCarta(rol: Rol): boolean {
  return esAdmin(rol);
}

export function puedeBorrarHistorial(rol: Rol): boolean {
  return esAdmin(rol);
}

export function puedeCambiarCamarero(rol: Rol): boolean {
  return esAdmin(rol);
}

export function puedeCrearComandas(rol: Rol): boolean {
  return rol === "ADMIN" || rol === "CAMARERO";
}

export function puedeVerPanel(rol: Rol): boolean {
  return rol === "ADMIN" || rol === "CAMARERO";
}

export function puedeVerHistorial(rol: Rol): boolean {
  return rol === "ADMIN" || rol === "CAMARERO";
}
