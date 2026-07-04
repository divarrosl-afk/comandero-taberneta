"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import type { DataBackend } from "@/lib/data/backend";
import { resetSupabaseClient } from "@/lib/supabase/client";
import type { SupabaseEnvConfig } from "@/lib/supabase/env";
import { initializeDataLayer } from "@/lib/data/data-layer";
import { setClientRuntimeConfig } from "@/lib/supabase/runtime-config";

interface PublicConfigResponse {
  ok: boolean;
  backend: DataBackend;
  missing: string[];
  supabase: SupabaseEnvConfig | null;
}

interface SupabaseConfigErrorProps {
  missing: string[];
  backend: string;
  onRetry: () => void;
  retrying: boolean;
}

export function SupabaseConfigError({
  missing,
  backend,
  onRetry,
  retrying,
}: SupabaseConfigErrorProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-8">
      <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-6">
        <h1 className="text-xl font-bold text-red-900">
          Configuración de Supabase incompleta
        </h1>
        <p className="mt-2 text-sm text-red-800">
          El backend está en modo <strong>{backend}</strong> pero faltan
          variables de entorno:
        </p>
        <ul className="mt-3 list-inside list-disc text-sm text-red-800">
          {missing.map((v) => (
            <li key={v}>
              <code className="text-xs">{v}</code>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-red-800">
          Configúralas en Vercel (Settings → Environment Variables) y redeploy,
          o ejecuta el workflow <strong>Vercel configure</strong> +{" "}
          <strong>Vercel redeploy</strong>.
        </p>
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="mt-4 rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {retrying ? "Reintentando…" : "Reintentar conexión"}
        </button>
      </div>
    </main>
  );
}

const RETRY_MS = 3000;
const MAX_AUTO_RETRIES = 5;

export function SupabaseConfigGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [missing, setMissing] = useState<string[]>([]);
  const [backend, setBackend] = useState<DataBackend>("local");
  const [retrying, setRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async () => {
    setRetrying(true);
    try {
      const res = await fetch("/api/config/public", {
        cache: "no-store",
        headers: { Pragma: "no-cache" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as PublicConfigResponse;

      setClientRuntimeConfig({
        backend: data.backend,
        supabase: data.supabase,
      });
      initializeDataLayer();
      resetSupabaseClient();

      if (data.ok) {
        setStatus("ready");
        return true;
      }

      setBackend(data.backend);
      setMissing(data.missing);
      setStatus("error");
      return false;
    } catch {
      setStatus("error");
      return false;
    } finally {
      setRetrying(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const ok = await load();
      if (cancelled || ok) return;

      for (let i = 0; i < MAX_AUTO_RETRIES; i++) {
        await new Promise((r) => setTimeout(r, RETRY_MS));
        if (cancelled) return;
        const retryOk = await load();
        if (retryOk) return;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [load, attempt]);

  if (status === "loading") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-4">
        <p className="text-sm text-muted">Cargando configuración…</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <SupabaseConfigError
        missing={
          missing.length > 0
            ? missing
            : [
                "NEXT_PUBLIC_SUPABASE_URL",
                "NEXT_PUBLIC_SUPABASE_ANON_KEY",
                "NEXT_PUBLIC_RESTAURANTE_ID",
              ]
        }
        backend={backend}
        onRetry={() => {
          setStatus("loading");
          setAttempt((n) => n + 1);
        }}
        retrying={retrying}
      />
    );
  }

  return children;
}
