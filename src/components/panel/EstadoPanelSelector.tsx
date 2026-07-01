"use client";

import { ESTADOS_PANEL } from "@/types/panel";
import type { EstadoPanel } from "@/types/panel";

interface EstadoPanelSelectorProps {
  value: EstadoPanel;
  onChange: (estado: EstadoPanel) => void;
  compact?: boolean;
}

export function EstadoPanelSelector({
  value,
  onChange,
  compact = false,
}: EstadoPanelSelectorProps) {
  return (
    <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 gap-2 sm:grid-cols-4"}>
      {ESTADOS_PANEL.map((estado) => {
        const activo = value === estado.id;
        return (
          <button
            key={estado.id}
            type="button"
            onClick={() => onChange(estado.id)}
            className={[
              "rounded-xl border-2 font-semibold transition active:scale-95",
              compact ? "min-h-10 px-2 text-xs" : "min-h-12 px-2 text-sm",
              activo
                ? `${estado.color} ring-2 ring-offset-1 ring-primary/30`
                : "border-border bg-card text-foreground hover:border-primary/30",
            ].join(" ")}
          >
            {compact ? estado.labelCorto : estado.label}
          </button>
        );
      })}
    </div>
  );
}
