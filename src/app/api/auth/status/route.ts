import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { usesRemoteData } from "@/lib/data/backend";
import { countPerfiles, seedSupabaseUsers } from "@/lib/setup/seed-users";

async function tryAutoSeed(restauranteId: string): Promise<{
  userCount: number;
  seeded: boolean;
  seedError?: string;
}> {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim();
  const camareroPassword = process.env.SEED_CAMARERO_PASSWORD?.trim();
  if (!adminPassword || !camareroPassword) {
    return { userCount: await countPerfiles(restauranteId), seeded: false };
  }

  try {
    const result = await seedSupabaseUsers({ adminPassword, camareroPassword });
    return { userCount: result.userCount, seeded: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error de seed";
    return {
      userCount: await countPerfiles(restauranteId),
      seeded: false,
      seedError: message,
    };
  }
}

/** Diagnóstico de usuarios (sin datos personales). Auto-seed si hay SEED_* en Vercel. */
export async function GET() {
  if (!usesRemoteData()) {
    return NextResponse.json({ seedRequired: false, userCount: 0 });
  }

  const admin = getSupabaseAdminClient();
  const env = getSupabaseEnv();
  if (!admin || !env?.restauranteId) {
    return NextResponse.json({ seedRequired: true, userCount: 0 });
  }

  let userCount = await countPerfiles(env.restauranteId);
  let seeded = false;
  let seedError: string | undefined;

  if (userCount === 0) {
    const auto = await tryAutoSeed(env.restauranteId);
    userCount = auto.userCount;
    seeded = auto.seeded;
    seedError = auto.seedError;
  }

  return NextResponse.json({
    seedRequired: userCount === 0,
    userCount,
    ...(seeded ? { seeded: true } : {}),
    ...(seedError ? { seedError } : {}),
  });
}
