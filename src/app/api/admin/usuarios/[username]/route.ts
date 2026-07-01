import { NextResponse } from "next/server";
import {
  actualizarUsuarioAdmin,
  verifyAdminRequest,
} from "@/lib/supabase/admin-users";
import type { Usuario, Rol } from "@/types/auth";

const VALID_ROLES: Rol[] = ["ADMIN", "CAMARERO"];
const MIN_PASSWORD_LENGTH = 6;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ username: string }> },
) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { username } = await context.params;
  let cambios: Partial<Usuario>;
  try {
    cambios = (await request.json()) as Partial<Usuario>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (cambios.rol && !VALID_ROLES.includes(cambios.rol)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  if (cambios.password !== undefined && cambios.password.trim().length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` },
      { status: 400 },
    );
  }

  try {
    const usuario = await actualizarUsuarioAdmin(username, {
      nombre: cambios.nombre,
      rol: cambios.rol,
      camareroId: cambios.camareroId,
      activo: cambios.activo,
      password: cambios.password,
    });
    return NextResponse.json({ usuario });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al actualizar usuario" },
      { status: 400 },
    );
  }
}
