import { NextResponse } from "next/server";
import {
  crearUsuarioAdmin,
  verifyAdminRequest,
} from "@/lib/supabase/admin-users";
import type { UsuarioInput, Rol } from "@/types/auth";

const VALID_ROLES: Rol[] = ["ADMIN", "CAMARERO"];
const MIN_PASSWORD_LENGTH = 6;

export async function POST(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: UsuarioInput;
  try {
    body = (await request.json()) as UsuarioInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.username?.trim() || !body.password?.trim() || !body.nombre?.trim()) {
    return NextResponse.json(
      { error: "Usuario, contraseña y nombre son obligatorios" },
      { status: 400 },
    );
  }

  if (body.password.trim().length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` },
      { status: 400 },
    );
  }

  if (body.rol && !VALID_ROLES.includes(body.rol)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  try {
    const usuario = await crearUsuarioAdmin({
      username: body.username,
      password: body.password,
      nombre: body.nombre,
      rol: body.rol ?? "CAMARERO",
      camareroId: body.camareroId,
      activo: body.activo ?? true,
    });
    return NextResponse.json({ usuario });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear usuario" },
      { status: 400 },
    );
  }
}
