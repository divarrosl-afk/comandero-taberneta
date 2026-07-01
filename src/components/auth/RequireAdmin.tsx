"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";

interface RequireAdminProps {
  children: ReactNode;
}

function SinPermisos() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-8">
        <p className="text-4xl" aria-hidden="true">
          🔒
        </p>
        <h1 className="mt-4 text-xl font-bold text-amber-950">
          Sin permisos
        </h1>
        <p className="mt-2 text-amber-900">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
      <Link href="/">
        <Button variant="secondary" size="lg">
          Volver al inicio
        </Button>
      </Link>
    </main>
  );
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const { sesion, listo } = useAuth();

  return (
    <RequireAuth>
      {!listo ? null : sesion?.rol === "ADMIN" ? children : <SinPermisos />}
    </RequireAuth>
  );
}
