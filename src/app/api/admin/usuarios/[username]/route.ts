import { NextResponse } from "next/server";
import {
  actualizarUsuarioAdmin,
  verifyAdminRequest,
} from "@/lib/supabase/admin-users";
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
