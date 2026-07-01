"use client";

import { getCamareroNombre } from "@/data/camareros";
import { getNombreMesa } from "@/lib/storage/mesas";

interface CabeceraComandaProps {
  mesa: string | null;
  camareroId: string | null;
}

export function CabeceraComanda({ mesa, camareroId }: CabeceraComandaProps) {
  const camarero = getCamareroNombre(camareroId);
  const mesaLabel = getNombreMesa(mesa);

  if (!mesa && !camarero) return null;

  return (
    <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        {mesa ? (
          <div className="rounded-xl bg-primary px-4 py-2 text-primary-foreground">
            <span className="text-xs font-medium uppercase opacity-80">Mesa</span>
            <p className="text-2xl font-bold leading-none">{mesaLabel}</p>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-2 text-amber-800">
            <p className="text-sm font-semibold">Sin mesa</p>
          </div>
        )}

        {camarero ? (
          <div className="flex-1 text-right">
            <span className="text-xs font-medium uppercase text-muted">
              Camarero
            </span>
            <p className="text-lg font-bold">{camarero}</p>
          </div>
        ) : (
          <div className="flex-1 text-right text-sm font-semibold text-amber-700">
            Elige camarero
          </div>
        )}
      </div>
    </div>
  );
}
