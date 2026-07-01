import { usernameToAuthEmail } from "@/lib/supabase/email";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { perfilToSesion, type DbPerfil } from "@/lib/supabase/mappers";
import type { AuthRepository } from "@/lib/auth/auth-repository";
import { guardarSesion, limpiarSesion } from "@/lib/storage/sesion";

async function fetchPerfil(authUserId: string): Promise<DbPerfil | null> {
  const client = getSupabaseClient();
  const env = getSupabaseEnv();
  if (!client || !env) return null;

  const { data, error } = await client
    .from("perfiles")
    .select("*")
    .eq("auth_user_id", authUserId)
    .eq("restaurante_id", env.restauranteId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return data as DbPerfil;
}

async function registrarAcceso(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  await client.rpc("ct_touch_ultimo_acceso");
}

export const authRepositorySupabase: AuthRepository = {
  async login(username, password) {
    const client = getSupabaseClient();
    if (!client) return null;

    const email = usernameToAuthEmail(username);
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) return null;

    const perfil = await fetchPerfil(data.user.id);
    if (!perfil || !perfil.activo) {
      await client.auth.signOut();
      return null;
    }

    await registrarAcceso();
    const sesion = perfilToSesion(perfil);
    guardarSesion(sesion);
    return sesion;
  },

  async logout() {
    const client = getSupabaseClient();
    if (client) await client.auth.signOut();
    limpiarSesion();
  },

  async restoreSession() {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data } = await client.auth.getSession();
    if (!data.session) {
      limpiarSesion();
      return null;
    }

    const perfil = await fetchPerfil(data.session.user.id);
    if (!perfil || !perfil.activo) {
      await client.auth.signOut();
      limpiarSesion();
      return null;
    }

    const sesion = perfilToSesion(perfil);
    guardarSesion(sesion);
    return sesion;
  },
};
