"use client";

import {
  ESTADOS_PANEL,
  indiceEstadoPanel,
} from "@/types/panel";
import type { EstadoPanel } from "@/types/panel";

interface SemaforoPanelSelectorProps {
  value: EstadoPanel;
  onChange: (estado: EstadoPanel) => void;
}

export function SemaforoPanelSelector({
  value,
  onChange,
}: SemaforoPanelSelectorProps) {
  const indiceActivo = indiceEstadoPanel(value);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Semáforo de marcha
      </p>

      <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-1">
          {ESTADOS_PANEL.map((estado, indice) => {
            const activo = value === estado.id;
            const pasado = indice < indiceActivo;
            return (
              <button
                key={estado.id}
                type="button"
                onClick={() => onChange(estado.id)}
                title={estado.label}
                className={[
                  "shrink-0 rounded-lg border-2 px-2 py-2 text-center font-bold transition active:scale-95",
                  "min-w-[3.25rem] text-[10px] leading-tight sm:min-w-[3.5rem] sm:text-xs",
                  activo
                    ? `${estado.color} ring-2 ring-offset-1 ring-primary/40`
                    : pasado
                      ? `${estado.color} opacity-80`
                      : "border-border bg-card text-muted hover:border-primary/30",
                ].join(" ")}
              >
                {estado.labelCorto}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-border"
        aria-hidden="true"
      >
        <div
          className="h-full bg-primary transition-all"
          style={{
            width: `${((indiceActivo + 1) / ESTADOS_PANEL.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
