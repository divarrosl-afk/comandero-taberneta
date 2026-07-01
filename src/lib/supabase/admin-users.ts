import { authEmailToUsername, usernameToAuthEmail } from "@/lib/supabase/email";
import { perfilToUsuario, type DbPerfil } from "@/lib/supabase/mappers";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Rol } from "@/types/auth";

const RESTAURANTE_ID =
  process.env.NEXT_PUBLIC_RESTAURANTE_ID?.trim() ?? "";
export async function contarAdminsActivos(
  excluirUsername?: string,
): Promise<number> {
  const admin = getSupabaseAdminClient();
  if (!admin || !RESTAURANTE_ID) return 0;

  let query = admin
    .from("perfiles")
    .select("username", { count: "exact", head: true })
    .eq("restaurante_id", RESTAURANTE_ID)
    .eq("rol", "ADMIN")
    .eq("activo", true)
    .is("deleted_at", null);

  if (excluirUsername) {
    query = query.neq("username", excluirUsername.trim().toLowerCase());
  }

  const { count } = await query;
  return count ?? 0;
}

export async function crearUsuarioAdmin(input: {
  username: string;
  password: string;
  nombre: string;
  rol: Rol;
  camareroId: string | null;
  activo: boolean;
}) {
  const admin = getSupabaseAdminClient();
  if (!admin || !RESTAURANTE_ID) {
    throw new Error("Supabase admin no configurado");
  }

  const username = input.username.trim().toLowerCase();
  const email = usernameToAuthEmail(username);

  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    throw new Error(authError?.message ?? "No se pudo crear el usuario Auth");
  }

  const camareroId =
    input.rol === "CAMARERO"
      ? input.camareroId?.trim().toLowerCase() || username
      : null;

  const { data: perfil, error: perfilError } = await admin
    .from("perfiles")
    .insert({
      auth_user_id: authData.user.id,
      restaurante_id: RESTAURANTE_ID,
      username,
      nombre: input.nombre.trim(),
      rol: input.rol,
      camarero_id: camareroId,
      activo: input.activo,
    })
    .select("*")
    .single();

  if (perfilError || !perfil) {
    await admin.auth.admin.deleteUser(authData.user.id);
    throw new Error(perfilError?.message ?? "No se pudo crear el perfil");
  }

  return perfilToUsuario(perfil as DbPerfil);
}

export async function actualizarUsuarioAdmin(
  username: string,
  cambios: {
    nombre?: string;
    rol?: Rol;
    camareroId?: string | null;
    activo?: boolean;
    password?: string;
  },
) {
  const admin = getSupabaseAdminClient();
  if (!admin || !RESTAURANTE_ID) {
    throw new Error("Supabase admin no configurado");
  }

  const key = username.trim().toLowerCase();
  const { data: perfil, error: fetchError } = await admin
    .from("perfiles")
    .select("*")
    .eq("restaurante_id", RESTAURANTE_ID)
    .eq("username", key)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError || !perfil) {
    throw new Error("Usuario no encontrado");
  }

  const dbPerfil = perfil as DbPerfil;

  if (cambios.activo === false && dbPerfil.rol === "ADMIN" && dbPerfil.activo) {
    const admins = await contarAdminsActivos(key);
    if (admins === 0) {
      throw new Error("No puedes desactivar al único administrador activo");
    }
  }

  const rol = cambios.rol ?? dbPerfil.rol;
  const camareroId =
    rol === "CAMARERO"
      ? (cambios.camareroId?.trim().toLowerCase() ??
        dbPerfil.camarero_id ??
        key)
      : null;

  const { data: actualizado, error: updateError } = await admin
    .from("perfiles")
    .update({
      nombre: cambios.nombre?.trim() ?? dbPerfil.nombre,
      rol,
      camarero_id: camareroId,
      activo: cambios.activo ?? dbPerfil.activo,
    })
    .eq("id", dbPerfil.id)
    .select("*")
    .single();

  if (updateError || !actualizado) {
    throw new Error(updateError?.message ?? "No se pudo actualizar el perfil");
  }

  if (cambios.password?.trim() && dbPerfil.auth_user_id) {
    const { error: pwdError } = await admin.auth.admin.updateUserById(
      dbPerfil.auth_user_id,
      { password: cambios.password },
    );
    if (pwdError) throw new Error(pwdError.message);
  }

  return perfilToUsuario(actualizado as DbPerfil);
}

export { authEmailToUsername, usernameToAuthEmail };
