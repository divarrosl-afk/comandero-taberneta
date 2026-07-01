import { NextResponse } from "next/server";
import { crearUsuarioAdmin } from "@/lib/supabase/admin-users";
import { verifyAdminRequest } from "@/lib/supabase/api-auth";
import {
  MIN_PASSWORD_LENGTH,
  normalizeUsername,
  validatePassword,
  validateRol,
  validateUsername,
} from "@/lib/api/validation";
import type { UsuarioInput } from "@/types/auth";

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

  const usernameError = validateUsername(body.username);
  if (usernameError) {
    return NextResponse.json({ error: usernameError }, { status: 400 });
  }

  const passwordError = validatePassword(body.password, MIN_PASSWORD_LENGTH);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const rolError = validateRol(body.rol);
  if (rolError) {
    return NextResponse.json({ error: rolError }, { status: 400 });
  }

  if (body.nombre.trim().length > 80) {
    return NextResponse.json(
      { error: "El nombre no puede superar 80 caracteres" },
      { status: 400 },
    );
  }

  try {
    const usuario = await crearUsuarioAdmin({
      username: normalizeUsername(body.username),
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
