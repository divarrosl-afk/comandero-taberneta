"use client";

import { OBSERVACIONES_RAPIDAS } from "@/data/comanda-catalogo";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { SectionCard } from "@/components/ui/SectionCard";

interface ObservacionesSectionProps {
  observaciones: string[];
  onChange: (index: number, valor: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onRapida: (texto: string) => void;
}

export function ObservacionesSection({
  observaciones,
  onChange,
  onAdd,
  onRemove,
  onRapida,
}: ObservacionesSectionProps) {
  return (
    <SectionCard
      title="Observaciones"
      actions={
        <Button variant="outline" size="sm" onClick={onAdd}>
          + Añadir
        </Button>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {OBSERVACIONES_RAPIDAS.map((obs) => (
          <Chip
            key={obs}
            label={obs}
            onClick={() => onRapida(obs)}
            size="sm"
          />
        ))}
      </div>

      <div className="space-y-2">
        {observaciones.map((obs, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={obs}
              onChange={(e) => onChange(index, e.target.value)}
              placeholder="Observación general..."
              className="min-h-12 flex-1 rounded-xl border-2 border-border bg-background px-3 text-base outline-none focus:border-primary"
            />
            {observaciones.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="flex min-h-12 min-w-12 items-center justify-center rounded-xl border-2 border-red-200 text-lg text-red-600"
                aria-label="Quitar observación"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
