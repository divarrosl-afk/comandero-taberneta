"use client";

import Link from "next/link";
import {
  CAMARERO_ACCESOS,
  hrefCamareroAcceso,
  type CamareroAccesoId,
} from "@/lib/navigation/camarero-accesos";

interface CamareroAccesosBarProps {
  activo?: CamareroAccesoId;
  mesaId?: string | null;
  layout?: "row" | "grid";
  className?: string;
}

export function CamareroAccesosBar({
  activo,
  mesaId,
  layout = "row",
  className = "",
}: CamareroAccesosBarProps) {
  const gridClass =
    layout === "grid"
      ? "grid grid-cols-2 gap-1.5"
      : "grid grid-cols-4 gap-1.5";

  return (
    <nav
      aria-label="Accesos rápidos camarero"
      className={[gridClass, className].filter(Boolean).join(" ")}
    >
      {CAMARERO_ACCESOS.map((acceso) => {
        const esActivo = activo === acceso.id;
        const href = hrefCamareroAcceso(acceso.id, mesaId);

        return (
          <Link
            key={acceso.id}
            href={href}
            aria-current={esActivo ? "page" : undefined}
            className={[
              "flex min-h-11 items-center justify-center rounded-lg text-xs font-extrabold tracking-wide text-white shadow-sm transition active:scale-95",
              esActivo ? acceso.activoClassName : acceso.className,
            ].join(" ")}
          >
            {acceso.label}
          </Link>
        );
      })}
    </nav>
  );
}
