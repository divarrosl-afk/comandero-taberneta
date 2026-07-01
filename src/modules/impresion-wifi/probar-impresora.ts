import { printTicket } from "@/modules/impresion-wifi/print-ticket";
import { resolveImpresoraConfig } from "@/modules/impresion-wifi/config";
import { getSupabaseAccessToken } from "@/lib/supabase/client";
import { usesRemoteData } from "@/lib/data/backend";
import { TEST_IMPRESORA_TEXTO } from "@/types/impresora";
import type { ImpresoraConfig } from "@/types/impresora";

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (usesRemoteData()) {
    const token = await getSupabaseAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/** Prueba TCP real vía API (ticket TEST + corte). */
export async function probarImpresora(impresora?: ImpresoraConfig) {
  const config = impresora ?? resolveImpresoraConfig();
  const headers = await authHeaders();

  const testRes = await fetch("/api/impresion/test", {
    method: "POST",
    headers,
    body: JSON.stringify({ impresora: config }),
  });

  const testData = (await testRes.json()) as {
    success: boolean;
    message: string;
    error?: string;
  };

  if (!testData.success) {
    return {
      ok: false,
      mode: "network" as const,
      destino: "cocina" as const,
      tipo: "reimpresion" as const,
      message: `❌ ${testData.message || testData.error || "No se pudo conectar"}`,
      simulated: false,
      timestamp: new Date().toISOString(),
      status: "error" as const,
    };
  }

  return printTicket(TEST_IMPRESORA_TEXTO, "cocina", {
    tipo: "reimpresion",
    impresora: config,
  });
}

export async function probarConexionImpresora(impresora?: ImpresoraConfig) {
  const config = impresora ?? resolveImpresoraConfig();
  const headers = await authHeaders();

  const res = await fetch("/api/impresion/test?probe=1", {
    method: "POST",
    headers,
    body: JSON.stringify({ impresora: { ...config, modo: "network" } }),
  });

  const data = (await res.json()) as {
    success: boolean;
    message: string;
    error?: string;
  };

  return {
    ok: data.success,
    message: data.success
      ? "✅ Impresora conectada"
      : `❌ ${data.message || data.error || "No se pudo conectar"}`,
    timestamp: new Date().toISOString(),
  };
}
