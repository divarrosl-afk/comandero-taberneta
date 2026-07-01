import { getSupabaseAccessToken } from "@/lib/supabase/client";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { perfilToUsuario, type DbPerfil } from "@/lib/supabase/mappers";
import type { UsuariosRepository } from "@/lib/auth/usuarios-repository";
import type { Usuario, UsuarioInput } from "@/types/auth";

async function authHeaders(): Promise<HeadersInit> {
  const token = await getSupabaseAccessToken();
  if (!token) throw new Error("Sesión no válida");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const usuariosRepositorySupabase: UsuariosRepository = {
  async getAll() {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return [];

    const { data, error } = await client
      .from("perfiles")
      .select("*")
      .eq("restaurante_id", env.restauranteId)
      .is("deleted_at", null)
      .order("username");

    if (error || !data) return [];
    return (data as DbPerfil[]).map((p) => perfilToUsuario(p));
  },

  async getByUsername(username) {
    const client = getSupabaseClient();
    const env = getSupabaseEnv();
    if (!client || !env) return undefined;

    const key = username.trim().toLowerCase();
    const { data, error } = await client
      .from("perfiles")
      .select("*")
      .eq("restaurante_id", env.restauranteId)
      .eq("username", key)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !data) return undefined;
    return perfilToUsuario(data as DbPerfil);
  },

  async crear(input) {
    const res = await fetch("/api/admin/usuarios", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(input),
    });

    const body = (await res.json()) as { usuario?: Usuario; error?: string };
    if (!res.ok) {
      throw new Error(body.error ?? "Error al crear usuario");
    }
    if (!body.usuario) throw new Error("Respuesta inválida del servidor");
    return body.usuario;
  },

  async actualizar(username, cambios) {
    const key = username.trim().toLowerCase();
    const res = await fetch(
      `/api/admin/usuarios/${encodeURIComponent(key)}`,
      {
        method: "PATCH",
        headers: await authHeaders(),
        body: JSON.stringify(cambios),
      },
    );

    const body = (await res.json()) as { usuario?: Usuario; error?: string };
    if (!res.ok) {
      throw new Error(body.error ?? "Error al actualizar usuario");
    }
    return body.usuario ?? null;
  },

  async registrarAcceso() {
    const client = getSupabaseClient();
    if (!client) return;

    await client.rpc("ct_touch_ultimo_acceso");
  },

  async restaurarIniciales() {
    throw new Error(
      "Restaurar usuarios iniciales no está disponible con Supabase",
    );
  },

  async contarAdminsActivos(excluir) {
    const usuarios = await this.getAll();
    const excl = excluir?.trim().toLowerCase();
    return usuarios.filter(
      (u) => u.rol === "ADMIN" && u.activo && u.username !== excl,
    ).length;
  },
};
