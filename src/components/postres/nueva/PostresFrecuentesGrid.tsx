"use client";

import { POSTRES_FRECUENTES } from "@/data/postres-catalogo";

interface PostresFrecuentesGridProps {
  onSelect: (nombre: string) => void;
}

export function PostresFrecuentesGrid({ onSelect }: PostresFrecuentesGridProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Postres frecuentes
      </p>
      <div className="grid grid-cols-2 gap-2">
        {POSTRES_FRECUENTES.map((nombre) => (
          <button
            key={nombre}
            type="button"
            onClick={() => onSelect(nombre)}
            className="flex min-h-14 items-center justify-center rounded-xl border-2 border-border bg-card px-2 text-center text-sm font-semibold transition active:scale-95 hover:border-accent/50 hover:bg-accent/5"
          >
            {nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
