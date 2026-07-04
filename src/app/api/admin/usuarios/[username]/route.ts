import { NextResponse } from "next/server";
import {
  actualizarUsuarioAdmin,
  eliminarUsuarioAdmin,
} from "@/lib/supabase/admin-users";
import { verifyAdminRequest } from "@/lib/supabase/api-auth";
import {
  MIN_PASSWORD_LENGTH,
  validatePassword,
  validateRol,
} from "@/lib/api/validation";
import type { Usuario } from "@/types/auth";

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

  const rolError = validateRol(cambios.rol);
  if (rolError) {
    return NextResponse.json({ error: rolError }, { status: 400 });
  }

  if (
    cambios.password !== undefined &&
    cambios.password.trim().length > 0
  ) {
    const passwordError = validatePassword(cambios.password, MIN_PASSWORD_LENGTH);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }
  }

  if (cambios.nombre !== undefined && cambios.nombre.trim().length > 80) {
    return NextResponse.json(
      { error: "El nombre no puede superar 80 caracteres" },
      { status: 400 },
    );
  }

  try {
    const usuario = await actualizarUsuarioAdmin(username, {
      nombre: cambios.nombre,
      rol: cambios.rol,
      camareroId: cambios.camareroId,
      activo: cambios.activo,
      password:
        cambios.password?.trim().length ? cambios.password : undefined,
    });
    return NextResponse.json({ usuario });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al actualizar usuario" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ username: string }> },
) {
  const auth = await verifyAdminRequest(_request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { username } = await context.params;

  try {
    await eliminarUsuarioAdmin(username);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al eliminar usuario" },
      { status: 400 },
    );
  }
}
