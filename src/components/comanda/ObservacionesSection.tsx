"use client";

import { Button } from "@/components/ui/Button";

interface ObservacionesSectionProps {
  observaciones: string[];
  onChange: (index: number, valor: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function ObservacionesSection({
  observaciones,
  onChange,
  onAdd,
  onRemove,
}: ObservacionesSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold uppercase tracking-wide">
          Observaciones
        </h2>
        <Button variant="outline" onClick={onAdd} className="min-h-10 px-3 text-sm">
          + Añadir
        </Button>
      </div>

      <div className="space-y-3">
        {observaciones.map((obs, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={obs}
              onChange={(e) => onChange(index, e.target.value)}
              placeholder="Ej: Primero sacar entrantes"
              className="min-h-12 flex-1 rounded-lg border border-border bg-background px-3 text-base outline-none focus:border-primary"
            />
            {observaciones.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-red-200 text-red-600"
                aria-label="Quitar observación"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
