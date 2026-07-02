"use client";

import { ESTADO_X_CAFE } from "@/data/postres-catalogo";
import { Chip } from "@/components/ui/Chip";
import { SectionCard } from "@/components/ui/SectionCard";
import type { EstadoCafeX } from "@/types/postres";

interface EstadoXCafeSelectorProps {
  value: EstadoCafeX | null;
  onChange: (estado: EstadoCafeX | null) => void;
}

export function EstadoXCafeSelector({
  value,
  onChange,
}: EstadoXCafeSelectorProps) {
  return (
    <SectionCard title="X café">
      <p className="mb-3 text-xs text-muted">
        Marca si la mesa no toma café
      </p>
      <div className="flex flex-wrap gap-2">
        {ESTADO_X_CAFE.map((estado) => (
          <Chip
            key={estado.id}
            label={estado.label}
            active={value === estado.id}
            onClick={() => onChange(estado.id)}
          />
        ))}
      </div>
    </SectionCard>
  );
}
