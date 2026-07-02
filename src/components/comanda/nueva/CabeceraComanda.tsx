"use client";

import { getNombreMesa } from "@/lib/storage/mesas";

interface CabeceraComandaProps {
  mesa: string | null;
}

export function CabeceraComanda({ mesa }: CabeceraComandaProps) {
  const mesaLabel = getNombreMesa(mesa);

  if (!mesa) return null;

  return (
    <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="rounded-xl bg-primary px-4 py-2 text-primary-foreground">
          <span className="text-xs font-medium uppercase opacity-80">Mesa</span>
          <p className="text-2xl font-bold leading-none">{mesaLabel}</p>
        </div>
      </div>
    </div>
  );
}
