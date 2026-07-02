import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { usesRemoteData } from "@/lib/data/backend";

/** Diagnóstico de usuarios (sin datos personales). */
export async function GET() {
  if (!usesRemoteData()) {
    return NextResponse.json({ seedRequired: false, userCount: 0 });
  }

  const admin = getSupabaseAdminClient();
  const env = getSupabaseEnv();
  if (!admin || !env?.restauranteId) {
    return NextResponse.json({ seedRequired: true, userCount: 0 });
  }

  const { count, error } = await admin
    .from("perfiles")
    .select("*", { count: "exact", head: true })
    .eq("restaurante_id", env.restauranteId)
    .is("deleted_at", null);

  const userCount = error ? 0 : (count ?? 0);

  return NextResponse.json({
    seedRequired: userCount === 0,
    userCount,
  });
}
