"use client";

import { ESTADOS_X } from "@/data/postres-catalogo";
import { Chip } from "@/components/ui/Chip";
import { SectionCard } from "@/components/ui/SectionCard";
import type { EstadoPostreX } from "@/types/postres";

interface EstadoXSelectorProps {
  value: EstadoPostreX | null;
  onChange: (estado: EstadoPostreX | null) => void;
}

export function EstadoXSelector({ value, onChange }: EstadoXSelectorProps) {
  return (
    <SectionCard title="X">
      <p className="mb-3 text-xs text-muted">
        Estado rápido del postre (sin postre / pendiente / marcado)
      </p>
      <div className="flex flex-wrap gap-2">
        {ESTADOS_X.map((estado) => (
          <Chip
            key={estado.id}
            label={estado.labelCorto}
            active={value === estado.id}
            onClick={() => onChange(estado.id)}
          />
        ))}
      </div>
    </SectionCard>
  );
}
