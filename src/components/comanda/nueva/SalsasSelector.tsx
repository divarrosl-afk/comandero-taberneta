"use client";

import { useMemo } from "react";
import { Chip } from "@/components/ui/Chip";
import { useCatalogo } from "@/hooks/useCatalogo";
import type { SalsaCantidad } from "@/types/comanda";

interface SalsasSelectorProps {
  salsas: SalsaCantidad[];
  onCycle: (id: string, nombre: string) => void;
}

export function SalsasSelector({ salsas, onCycle }: SalsasSelectorProps) {
  const { productos } = useCatalogo();

  const catalogoSalsas = useMemo(
    () =>
      productos
        .filter((p) => p.seccion === "salsas" && p.activo)
        .sort((a, b) => {
          if (a.favorito !== b.favorito) return a.favorito ? -1 : 1;
          return a.nombre.localeCompare(b.nombre, "es");
        }),
    [productos],
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Salsas{" "}
        <span className="font-normal normal-case">
          (toca para x1 → x2 → x3 → quitar)
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {catalogoSalsas.map((salsa) => {
          const cantidad =
            salsas.find((s) => s.id === salsa.id)?.cantidad ?? 0;
          return (
            <Chip
              key={salsa.id}
              label={salsa.nombre}
              count={cantidad}
              active={cantidad > 0}
              onClick={() => onCycle(salsa.id, salsa.nombre)}
              size="sm"
              variant="accent"
            />
          );
        })}
      </div>
    </div>
  );
}
