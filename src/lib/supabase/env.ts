import { getDataBackend, usesRemoteData } from "@/lib/data/backend";

export interface SupabaseEnvConfig {
  url: string;
  anonKey: string;
  restauranteId: string;
}

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

/** Supabase nuevo wizard usa PUBLISHABLE_KEY; legacy usa ANON_KEY. */
function readSupabaseAnonKey(): string | undefined {
  return (
    readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ??
    readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  );
}

/**
 * Devuelve la configuración de Supabase si las tres variables públicas existen.
 * Con `DATA_BACKEND=local` puede devolver `null` sin afectar a la app.
 */
export function getSupabaseEnv(): SupabaseEnvConfig | null {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readSupabaseAnonKey();
  const restauranteId = readEnv("NEXT_PUBLIC_RESTAURANTE_ID");

  if (!url || !anonKey || !restauranteId) {
    return null;
  }

  return { url, anonKey, restauranteId };
}

export function isSupabaseEnvConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

/**
 * Indica si el backend seleccionado espera Supabase pero faltan variables.
 * No lanza error — solo sirve para avisos en fases futuras.
 */
export function isSupabaseEnvMissingForBackend(): boolean {
  if (!usesRemoteData()) return false;
  return !isSupabaseEnvConfigured();
}

/**
 * Valida coherencia backend ↔ env. Con `local` siempre es válido.
 */
export function validateSupabaseSetup(): {
  ok: boolean;
  backend: ReturnType<typeof getDataBackend>;
  missing: string[];
} {
  const backend = getDataBackend();

  if (!usesRemoteData()) {
    return { ok: true, backend, missing: [] };
  }

  const missing: string[] = [];
  if (!readEnv("NEXT_PUBLIC_SUPABASE_URL")) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!readSupabaseAnonKey()) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (!readEnv("NEXT_PUBLIC_RESTAURANTE_ID")) {
    missing.push("NEXT_PUBLIC_RESTAURANTE_ID");
  }

  return { ok: missing.length === 0, backend, missing };
}
