"use client";

import { getNombreMesa } from "@/lib/storage/mesas";
import { ComensalesRapido } from "@/components/comanda/nueva/ComensalesRapido";

interface CabeceraComandaProps {
  mesa: string | null;
  comensales?: number | null;
  onComensales?: (n: number | null) => void;
}

export function CabeceraComanda({
  mesa,
  comensales = null,
  onComensales,
}: CabeceraComandaProps) {
  const mesaLabel = getNombreMesa(mesa);

  if (!mesa) return null;

  return (
    <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto max-w-lg space-y-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary px-4 py-2 text-primary-foreground">
            <span className="text-xs font-medium uppercase opacity-80">Mesa</span>
            <p className="text-2xl font-bold leading-none">{mesaLabel}</p>
          </div>
          {comensales && comensales > 0 && !onComensales && (
            <div className="rounded-xl border-2 border-border bg-background px-3 py-2">
              <span className="text-xs font-medium uppercase text-muted">
                Comensales
              </span>
              <p className="text-xl font-bold leading-none text-foreground">
                {comensales}
              </p>
            </div>
          )}
        </div>
        {onComensales && (
          <ComensalesRapido
            value={comensales}
            onChange={onComensales}
            compact
          />
        )}
      </div>
    </div>
  );
}
