import type { Rol } from "@/types/auth";

const USERNAME_RE = /^[a-z0-9_-]{2,32}$/;
const MIN_PASSWORD_LENGTH = 6;
const VALID_ROLES: Rol[] = ["ADMIN", "CAMARERO"];

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateUsername(username: string): string | null {
  const key = normalizeUsername(username);
  if (!USERNAME_RE.test(key)) {
    return "Usuario inválido (2–32 caracteres: a-z, 0-9, _, -)";
  }
  return null;
}

export function validatePassword(password: string, min = MIN_PASSWORD_LENGTH): string | null {
  const trimmed = password.trim();
  if (trimmed.length < min) {
    return `La contraseña debe tener al menos ${min} caracteres`;
  }
  return null;
}

export function validateRol(rol: Rol | undefined): string | null {
  if (rol && !VALID_ROLES.includes(rol)) {
    return "Rol inválido";
  }
  return null;
}

export { MIN_PASSWORD_LENGTH, VALID_ROLES };
