"use client";

import { Chip } from "@/components/ui/Chip";
import { SALSAS } from "@/data/comanda-catalogo";
import type { SalsaCantidad } from "@/types/comanda";

interface SalsasSelectorProps {
  salsas: SalsaCantidad[];
  onCycle: (id: string, nombre: string) => void;
}

export function SalsasSelector({ salsas, onCycle }: SalsasSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Salsas{" "}
        <span className="font-normal normal-case">
          (toca para x1 → x2 → x3 → quitar)
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {SALSAS.map((salsa) => {
          const cantidad =
            salsas.find((s) => s.id === salsa.id)?.cantidad ?? 0;
          const label = salsa.labelCorto ?? salsa.label;
          return (
            <Chip
              key={salsa.id}
              label={label}
              count={cantidad}
              active={cantidad > 0}
              onClick={() => onCycle(salsa.id, salsa.label)}
              size="sm"
              variant="accent"
            />
          );
        })}
      </div>
    </div>
  );
}
