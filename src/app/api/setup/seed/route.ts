import { NextResponse } from "next/server";
import { seedSupabaseUsers } from "@/lib/setup/seed-users";

function authorized(req: Request): boolean {
  const token = process.env.SETUP_BOOTSTRAP_TOKEN?.trim();
  if (!token) return false;
  const auth = req.headers.get("authorization")?.trim() ?? "";
  return auth === `Bearer ${token}`;
}

/** Seed idempotente de usuarios — solo con SETUP_BOOTSTRAP_TOKEN (CI / setup). */
export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  let body: { adminPassword?: string; camareroPassword?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
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
