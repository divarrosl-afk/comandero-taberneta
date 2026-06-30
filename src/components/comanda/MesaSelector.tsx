"use client";

import { mesas } from "@/data/mesas";

interface MesaSelectorProps {
  mesaSeleccionada: number | null;
  onSelect: (mesa: number) => void;
  compact?: boolean;
}

export function MesaSelector({
  mesaSeleccionada,
  onSelect,
  compact = false,
}: MesaSelectorProps) {
  return (
    <div className={compact ? "" : "space-y-3"}>
      {!compact && <h2 className="text-base font-bold uppercase">Mesa</h2>}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {mesas.map((mesa) => {
          const activa = mesaSeleccionada === mesa;
          return (
            <button
              key={mesa}
              type="button"
              onClick={() => onSelect(mesa)}
              className={[
                "flex items-center justify-center rounded-xl font-bold transition active:scale-95",
                compact ? "min-h-12 text-base" : "min-h-14 text-lg",
                activa
                  ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                  : "border-2 border-border bg-card hover:border-primary/40",
              ].join(" ")}
            >
              {mesa}
            </button>
          );
        })}
      </div>
    </div>
  );
}
