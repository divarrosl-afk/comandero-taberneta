"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export function UserBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sesion, cerrarSesion, usaSupabase } = useAuth();

  if (pathname === "/login" || !sesion) return null;

  const rolLabel = sesion.rol === "ADMIN" ? "Admin" : "Camarero";

  const handleLogout = async () => {
    await cerrarSesion();
    router.replace("/login");
  };

  return (
    <div className="border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">
            {sesion.nombre}
          </p>
          <p className="text-xs text-muted">
            <span
              className={[
                "mr-1 inline-block rounded-full px-2 py-0.5 font-semibold uppercase",
                sesion.rol === "ADMIN"
                  ? "bg-amber-100 text-amber-900"
                  : "bg-sky-100 text-sky-900",
              ].join(" ")}
            >
              {rolLabel}
            </span>
            @{sesion.username}
            {usaSupabase && (
              <span className="ml-1 text-[10px] uppercase text-accent">
                · cloud
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
