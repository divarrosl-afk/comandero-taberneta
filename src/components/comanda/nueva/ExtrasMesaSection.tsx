"use client";

import { useMemo } from "react";
import { Chip } from "@/components/ui/Chip";
import { SectionCard } from "@/components/ui/SectionCard";
import { useCatalogo } from "@/hooks/useCatalogo";
import type { ExtraMesaItem } from "@/types/comanda";

interface ExtrasMesaSectionProps {
  extras: ExtraMesaItem[];
  onCycle: (id: string, nombre: string) => void;
}

export function ExtrasMesaSection({ extras, onCycle }: ExtrasMesaSectionProps) {
  const { productos } = useCatalogo();

  const catalogoExtras = useMemo(
    () =>
      productos
        .filter(
          (p) =>
            p.activo &&
            (p.usosComanda?.includes("extras") || p.seccion === "extras"),
        )
        .sort((a, b) => {
          if (a.favorito !== b.favorito) return a.favorito ? -1 : 1;
          return a.nombre.localeCompare(b.nombre, "es");
        }),
    [productos],
  );

  return (
    <SectionCard title="Extras de mesa">
      <p className="mb-3 text-xs text-muted">
        Toca para añadir cantidad (x1 → x2 → x3 → quitar)
      </p>
      <div className="flex flex-wrap gap-2">
        {catalogoExtras.map((extra) => {
          const cantidad =
            extras.find((e) => e.id === extra.id)?.cantidad ?? 0;
          return (
            <Chip
              key={extra.id}
              label={extra.nombre}
              count={cantidad}
              active={cantidad > 0}
              onClick={() => onCycle(extra.id, extra.nombre)}
            />
          );
        })}
      </div>
    </SectionCard>
  );
}
