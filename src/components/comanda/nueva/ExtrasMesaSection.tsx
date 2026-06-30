"use client";

import { EXTRAS_MESA } from "@/data/comanda-catalogo";
import { Chip } from "@/components/ui/Chip";
import { SectionCard } from "@/components/ui/SectionCard";
import type { ExtraMesaId, ExtraMesaItem } from "@/types/comanda";

interface ExtrasMesaSectionProps {
  extras: ExtraMesaItem[];
  onCycle: (id: ExtraMesaId) => void;
}

export function ExtrasMesaSection({ extras, onCycle }: ExtrasMesaSectionProps) {
  return (
    <SectionCard title="Extras de mesa">
      <p className="mb-3 text-xs text-muted">
        Toca para añadir cantidad (x1 → x2 → x3 → quitar)
      </p>
      <div className="flex flex-wrap gap-2">
        {EXTRAS_MESA.map((extra) => {
          const cantidad =
            extras.find((e) => e.id === extra.id)?.cantidad ?? 0;
          return (
            <Chip
              key={extra.id}
              label={extra.labelCorto ?? extra.label}
              count={cantidad}
              active={cantidad > 0}
              onClick={() => onCycle(extra.id)}
            />
          );
        })}
      </div>
    </SectionCard>
  );
}
