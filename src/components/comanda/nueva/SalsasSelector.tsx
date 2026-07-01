"use client";

import { SALSAS } from "@/data/comanda-catalogo";
import { Chip } from "@/components/ui/Chip";
import type { SalsaCantidad, SalsaId } from "@/types/comanda";

interface SalsasSelectorProps {
  salsas: SalsaCantidad[];
  onCycle: (id: SalsaId) => void;
}

export function SalsasSelector({ salsas, onCycle }: SalsasSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Salsas <span className="font-normal normal-case">(toca para x1 → x2 → x3 → quitar)</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {SALSAS.map((salsa) => {
          const cantidad =
            salsas.find((s) => s.id === salsa.id)?.cantidad ?? 0;
          return (
            <Chip
              key={salsa.id}
              label={salsa.labelCorto ?? salsa.label}
              count={cantidad}
              active={cantidad > 0}
              onClick={() => onCycle(salsa.id)}
              size="sm"
              variant="accent"
            />
          );
        })}
      </div>
    </div>
  );
}
