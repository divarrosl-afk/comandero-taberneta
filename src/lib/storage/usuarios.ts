import { usuariosIniciales } from "@/data/usuarios";
import type { Usuario, UsuarioInput } from "@/types/auth";

const STORAGE_KEY = "comandero-taberneta:usuarios";

function migrarUsuario(raw: Partial<Usuario>): Usuario {
  return {
    username: (raw.username ?? "").trim().toLowerCase(),
    password: raw.password ?? "",
    rol: raw.rol === "ADMIN" ? "ADMIN" : "CAMARERO",
    nombre: (raw.nombre ?? "").trim(),
    camareroId: raw.camareroId ?? null,
    activo: raw.activo ?? true,
    ultimoAcceso: raw.ultimoAcceso ?? null,
    creadoEn: raw.creadoEn ?? new Date().toISOString(),
  };
}

function normalizar(usuario: Usuario): Usuario {
  const m = migrarUsuario(usuario);
  return {
    ...m,
    username: m.username.toLowerCase(),
    nombre: m.nombre.trim(),
    camareroId:
      m.rol === "CAMARERO"
        ? m.camareroId?.trim().toLowerCase() || m.username
        : null,
  };
}

export function getUsuarios(): Usuario[] {
  if (typeof window === "undefined") return usuariosIniciales.map(normalizar);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = usuariosIniciales.map(normalizar);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw) as Partial<Usuario>[];
    return Array.isArray(parsed)
      ? parsed.map((u) => normalizar(migrarUsuario(u)))
      : usuariosIniciales.map(normalizar);
  } catch {
    return usuariosIniciales.map(normalizar);
  }
}

export function guardarUsuarios(usuarios: Usuario[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(usuarios.map(normalizar)),
  );
}

export function getUsuario(username: string): Usuario | undefined {
  const key = username.trim().toLowerCase();
  return getUsuarios().find((u) => u.username === key);
}

export function crearUsuario(input: UsuarioInput): Usuario {
  const usuario = normalizar({
    ...input,
    username: input.username.trim().toLowerCase(),
    ultimoAcceso: null,
    creadoEn: new Date().toISOString(),
  });

  const existente = getUsuario(usuario.username);
  if (existente) {
    throw new Error("Ya existe un usuario con ese nombre");
  }

  guardarUsuarios([...getUsuarios(), usuario]);
  return usuario;
}

export function actualizarUsuario(
  username: string,
  cambios: Partial<Usuario>,
): Usuario | null {
  const key = username.trim().toLowerCase();
  const usuarios = getUsuarios();
  const index = usuarios.findIndex((u) => u.username === key);
  if (index === -1) return null;

  const actualizado = normalizar({
    ...usuarios[index],
    ...cambios,
    username: key,
  });

  usuarios[index] = actualizado;
  guardarUsuarios(usuarios);
  return actualizado;
}

export function registrarUltimoAcceso(username: string): void {
  actualizarUsuario(username, { ultimoAcceso: new Date().toISOString() });
}

export function eliminarUsuario(username: string): boolean {
  const key = username.trim().toLowerCase();
  const usuarios = getUsuarios().filter((u) => u.username !== key);
  if (usuarios.length === getUsuarios().length) return false;
  guardarUsuarios(usuarios);
  return true;
}

export function resetUsuarios(): Usuario[] {
  const defaults = usuariosIniciales.map(normalizar);
  guardarUsuarios(defaults);
  return defaults;
}

export function contarAdminsActivos(excluir?: string): number {
  return getUsuarios().filter(
    (u) =>
      u.rol === "ADMIN" &&
      u.activo &&
      u.username !== excluir?.trim().toLowerCase(),
  ).length;
}
