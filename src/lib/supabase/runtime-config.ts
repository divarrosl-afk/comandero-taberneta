import type { DataBackend } from "@/lib/data/backend";
import type { SupabaseEnvConfig } from "@/lib/supabase/env";

export interface ClientRuntimeConfig {
  backend: DataBackend;
  supabase: SupabaseEnvConfig | null;
}

let clientRuntimeConfig: ClientRuntimeConfig | null = null;

export function setClientRuntimeConfig(config: ClientRuntimeConfig): void {
  clientRuntimeConfig = config;
}

export function getClientRuntimeConfig(): ClientRuntimeConfig | null {
  return clientRuntimeConfig;
}

export function clearClientRuntimeConfig(): void {
  clientRuntimeConfig = null;
}
