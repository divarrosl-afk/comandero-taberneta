import { createClient } from "@supabase/supabase-js";
import type { Rol } from "@/types/auth";

const RESTAURANTE_ID =
  process.env.NEXT_PUBLIC_RESTAURANTE_ID?.trim() ?? "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

const VALID_ROLES: Rol[] = ["ADMIN", "CAMARERO"];

export type AuthFail = { ok: false; status: number; error: string };
export type AuthOk = { ok: true; username: string; rol: Rol };

export async function verifyAuthenticatedRequest(
  request: Request,
): Promise<AuthOk | AuthFail> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ok: false,
      status: 401,
      error: "Sesión requerida — inicia sesión de nuevo",
    };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return {
      ok: false,
      status: 401,
      error: "Token de sesión vacío",
    };
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !RESTAURANTE_ID) {
    return {
      ok: false,
      status: 500,
      error: "Supabase no configurado en servidor",
    };
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return { ok: false, status: 401, error: "Sesión no válida o expirada" };
  }

  const { data: perfil, error: perfilError } = await userClient
    .from("perfiles")
    .select("username, rol, activo")
    .eq("auth_user_id", userData.user.id)
    .eq("restaurante_id", RESTAURANTE_ID)
    .is("deleted_at", null)
    .maybeSingle();

  if (perfilError || !perfil) {
    return { ok: false, status: 403, error: "Perfil no encontrado" };
  }

  if (!perfil.activo) {
    return { ok: false, status: 403, error: "Usuario inactivo" };
  }

  const rol = perfil.rol as Rol;
  if (!VALID_ROLES.includes(rol)) {
    return { ok: false, status: 403, error: "Sin permisos" };
  }

  return { ok: true, username: perfil.username as string, rol };
}

export async function verifyAdminRequest(
  request: Request,
): Promise<{ ok: true; username: string } | AuthFail> {
  const session = await verifyAuthenticatedRequest(request);
  if (!session.ok) return session;
  if (session.rol !== "ADMIN") {
    return { ok: false, status: 403, error: "Solo administradores" };
  }
  return { ok: true, username: session.username };
}
