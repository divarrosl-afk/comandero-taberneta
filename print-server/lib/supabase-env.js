/** Lee variables Supabase en runtime (no al importar el módulo). */

export function readCloudEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "",
    restauranteId: process.env.SUPABASE_RESTAURANTE_ID?.trim() ?? "",
    pollMs: Number(process.env.CLOUD_POLL_MS ?? 3000),
  };
}

export function getMissingCloudEnv() {
  const { supabaseUrl, serviceRoleKey, restauranteId } = readCloudEnv();
  const missing = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!restauranteId) missing.push("SUPABASE_RESTAURANTE_ID");
  return missing;
}

export function isSupabaseConfigured() {
  return getMissingCloudEnv().length === 0;
}
