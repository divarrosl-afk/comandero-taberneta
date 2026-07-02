"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { DataBackend } from "@/lib/data/backend";
import { resetSupabaseClient } from "@/lib/supabase/client";
import type { SupabaseEnvConfig } from "@/lib/supabase/env";
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
}

export function SupabaseConfigError({
  missing,
  backend,
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
      </div>
    </main>
  );
}

export function SupabaseConfigGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [missing, setMissing] = useState<string[]>([]);
  const [backend, setBackend] = useState<DataBackend>("local");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/config/public", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as PublicConfigResponse;
        if (cancelled) return;

        setClientRuntimeConfig({
          backend: data.backend,
          supabase: data.supabase,
        });
        resetSupabaseClient();

        if (data.ok) {
          setStatus("ready");
          return;
        }

        setBackend(data.backend);
        setMissing(data.missing);
        setStatus("error");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

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
      />
    );
  }

  return children;
}
