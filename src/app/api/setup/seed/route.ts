import { NextResponse } from "next/server";
import { seedSupabaseUsers } from "@/lib/setup/seed-users";

function authorized(
  req: Request,
  body: { adminPassword?: string; camareroPassword?: string },
): boolean {
  const token = process.env.SETUP_BOOTSTRAP_TOKEN?.trim();
  if (token) {
    const auth = req.headers.get("authorization")?.trim() ?? "";
    if (auth === `Bearer ${token}`) return true;
  }

  const envAdmin = process.env.SEED_ADMIN_PASSWORD?.trim();
  const envCamarero = process.env.SEED_CAMARERO_PASSWORD?.trim();
  if (!envAdmin || !envCamarero) return false;

  return (
    body.adminPassword?.trim() === envAdmin &&
    body.camareroPassword?.trim() === envCamarero
  );
}

/** Seed idempotente de usuarios — SETUP_BOOTSTRAP_TOKEN o contraseñas SEED_* del servidor. */
export async function POST(req: Request) {
  let body: { adminPassword?: string; camareroPassword?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  if (!authorized(req, body)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const adminPassword = body.adminPassword?.trim() ?? "";
  const camareroPassword = body.camareroPassword?.trim() ?? "";

  if (!adminPassword || !camareroPassword) {
    return NextResponse.json(
      { ok: false, error: "Faltan adminPassword o camareroPassword" },
      { status: 400 },
    );
  }

  try {
    const result = await seedSupabaseUsers({ adminPassword, camareroPassword });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error de seed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
