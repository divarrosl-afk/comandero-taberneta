import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { usernameToAuthEmail } from "@/lib/supabase/email";

export interface SeedUserInput {
  username: string;
  nombre: string;
  rol: "ADMIN" | "CAMARERO";
  camareroId: string | null;
  password: string;
}

export interface SeedUsersOptions {
  adminPassword: string;
  camareroPassword: string;
  restauranteId?: string;
}

export interface SeedUsersResult {
  ok: boolean;
  created: string[];
  skipped: string[];
  userCount: number;
}

const DEFAULT_USERS = (adminPassword: string, camareroPassword: string): SeedUserInput[] => [
  { username: "divarro", nombre: "Divarro", rol: "ADMIN", camareroId: null, password: adminPassword },
  { username: "david", nombre: "David", rol: "CAMARERO", camareroId: "david", password: camareroPassword },
  { username: "ingrid", nombre: "Ingrid", rol: "CAMARERO", camareroId: "ingrid", password: camareroPassword },
  { username: "cocina", nombre: "Cocina", rol: "CAMARERO", camareroId: "cocina", password: camareroPassword },
];

async function findAuthUserByEmail(
  admin: SupabaseClient,
  targetEmail: string,
) {
  let page = 1;
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    const found = data.users.find(
      (u) => u.email?.toLowerCase() === targetEmail.toLowerCase(),
    );
    if (found) return found;
    if (data.users.length < 200) break;
    page += 1;
  }
  return null;
}

async function ensureRestaurante(admin: SupabaseClient, restauranteId: string) {
  const { data } = await admin
    .from("restaurantes")
    .select("id")
    .eq("id", restauranteId)
    .maybeSingle();

  if (data) return;

  const { error } = await admin.from("restaurantes").insert({
    id: restauranteId,
    nombre: "La Taberneta de Ca la Ingrid",
    slug: "la-taberneta",
    activo: true,
  });

  if (error) throw new Error(`Restaurante: ${error.message}`);
}

async function ensureUsuario(
  admin: SupabaseClient,
  restauranteId: string,
  user: SeedUserInput,
): Promise<"created" | "skipped"> {
  const authEmail = usernameToAuthEmail(user.username);

  const { data: existente } = await admin
    .from("perfiles")
    .select("id, auth_user_id")
    .eq("restaurante_id", restauranteId)
    .eq("username", user.username)
    .maybeSingle();

  if (existente?.auth_user_id) return "skipped";

  let authUserId = existente?.auth_user_id ?? null;

  if (!authUserId) {
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: authEmail,
      password: user.password,
      email_confirm: true,
    });

    if (authError) {
      const duplicate =
        authError.message.includes("already been registered") ||
        authError.message.includes("already exists");
      if (!duplicate) throw new Error(`${user.username} Auth: ${authError.message}`);
      const existing = await findAuthUserByEmail(admin, authEmail);
      if (!existing) throw new Error(`${user.username} Auth duplicado pero no encontrado`);
      authUserId = existing.id;
    } else if (authData.user) {
      authUserId = authData.user.id;
    }
  }

  if (!authUserId) throw new Error(`${user.username}: sin auth_user_id`);

  if (existente?.id) {
    const { error: linkError } = await admin
      .from("perfiles")
      .update({ auth_user_id: authUserId, activo: true })
      .eq("id", existente.id);
    if (linkError) throw new Error(`${user.username} enlace: ${linkError.message}`);
    return "created";
  }

  const { error: perfilError } = await admin.from("perfiles").insert({
    auth_user_id: authUserId,
    restaurante_id: restauranteId,
    username: user.username,
    nombre: user.nombre,
    rol: user.rol,
    camarero_id: user.camareroId,
    activo: true,
  });

  if (perfilError) throw new Error(`${user.username} perfil: ${perfilError.message}`);
  return "created";
}

export async function seedSupabaseUsers(
  options: SeedUsersOptions,
): Promise<SeedUsersResult> {
  const admin = getSupabaseAdminClient();
  const env = getSupabaseEnv();
  const restauranteId =
    options.restauranteId?.trim() || env?.restauranteId || "";

  if (!admin || !restauranteId) {
    throw new Error("Supabase admin o restauranteId no configurado");
  }

  await ensureRestaurante(admin, restauranteId);

  const users = DEFAULT_USERS(options.adminPassword, options.camareroPassword);
  const created: string[] = [];
  const skipped: string[] = [];

  for (const user of users) {
    const result = await ensureUsuario(admin, restauranteId, user);
    if (result === "created") created.push(user.username);
    else skipped.push(user.username);
  }

  const { count } = await admin
    .from("perfiles")
    .select("*", { count: "exact", head: true })
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null);

  return {
    ok: true,
    created,
    skipped,
    userCount: count ?? 0,
  };
}

export async function countPerfiles(restauranteId: string): Promise<number> {
  const admin = getSupabaseAdminClient();
  if (!admin) return 0;
  const { count } = await admin
    .from("perfiles")
    .select("*", { count: "exact", head: true })
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null);
  return count ?? 0;
}
