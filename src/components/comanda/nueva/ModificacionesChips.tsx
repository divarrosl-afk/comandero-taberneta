"use client";

import { MODIFICACIONES } from "@/data/comanda-catalogo";
import { Chip } from "@/components/ui/Chip";
import type { ModificacionId } from "@/types/comanda";

interface ModificacionesChipsProps {
  seleccionadas: ModificacionId[];
  onToggle: (id: ModificacionId) => void;
}

export function ModificacionesChips({
  seleccionadas,
  onToggle,
}: ModificacionesChipsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Modificaciones
      </p>
      <div className="flex flex-wrap gap-2">
        {MODIFICACIONES.map((mod) => (
          <Chip
            key={mod.id}
            label={mod.labelCorto ?? mod.label}
            active={seleccionadas.includes(mod.id)}
            onClick={() => onToggle(mod.id)}
            size="sm"
            variant={
              mod.id === "urgente" && seleccionadas.includes(mod.id)
                ? "urgent"
                : mod.id === "urgente"
                  ? "urgent"
                  : "default"
            }
          />
        ))}
      </div>
    </div>
  );
}
