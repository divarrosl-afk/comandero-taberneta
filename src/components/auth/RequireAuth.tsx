"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { sesion, listo } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!listo || sesion) return;
    const redirect = encodeURIComponent(pathname);
    router.replace(`/login?redirect=${redirect}`);
  }, [listo, sesion, pathname, router]);

  if (!listo) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-4">
        <p className="text-muted">Cargando sesión…</p>
      </main>
    );
  }

  if (!sesion) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold">Sesión requerida</p>
        <p className="text-sm text-muted">
          Inicia sesión para acceder al comandero.
        </p>
        <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>
          <Button size="lg">Ir a iniciar sesión</Button>
        </Link>
      </main>
    );
  }

  return <>{children}</>;
}
