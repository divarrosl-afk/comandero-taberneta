import { getClientRuntimeConfig } from "@/lib/supabase/runtime-config";

export type DataBackend = "local" | "supabase" | "hybrid";

const VALID_BACKENDS: DataBackend[] = ["local", "supabase", "hybrid"];

/**
 * Lee el backend de datos configurado.
 * En cliente, prioriza la config cargada en runtime desde /api/config/public.
 */
export function getDataBackend(): DataBackend {
  if (typeof window !== "undefined") {
    const runtime = getClientRuntimeConfig()?.backend;
    if (runtime) return runtime;
  }

  const raw = process.env.NEXT_PUBLIC_DATA_BACKEND?.trim().toLowerCase();

  if (raw && VALID_BACKENDS.includes(raw as DataBackend)) {
    return raw as DataBackend;
  }

  return "local";
}

export function isLocalBackend(): boolean {
  return getDataBackend() === "local";
}

export function isSupabaseBackend(): boolean {
  return getDataBackend() === "supabase";
}

export function isHybridBackend(): boolean {
  return getDataBackend() === "hybrid";
}

/** Supabase o híbrido requieren cliente remoto en fases futuras. */
export function usesRemoteData(): boolean {
  const backend = getDataBackend();
  return backend === "supabase" || backend === "hybrid";
}
