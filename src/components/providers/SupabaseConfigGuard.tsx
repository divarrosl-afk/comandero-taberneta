"use client";

import type { ReactNode } from "react";
import { validateSupabaseSetup } from "@/lib/supabase/env";

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
          Configúralas en <code className="text-xs">.env.local</code> o vuelve a
          modo local con{" "}
          <code className="text-xs">NEXT_PUBLIC_DATA_BACKEND=local</code>.
        </p>
      </div>
    </main>
  );
}

export function SupabaseConfigGuard({ children }: { children: ReactNode }) {
  const setup = validateSupabaseSetup();

  if (!setup.ok) {
    return (
      <SupabaseConfigError
        missing={setup.missing}
        backend={setup.backend}
      />
    );
  }

  return children;
}
