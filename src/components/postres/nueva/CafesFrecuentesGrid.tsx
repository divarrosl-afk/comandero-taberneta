"use client";

import {
  etiquetaCarajillo,
  INFUSIONES,
  OPCIONES_CAFE,
  SABORES_CARAJILLO,
} from "@/data/cafes-catalogo";

interface CafesFrecuentesGridProps {
  onSelect: (etiquetaTicket: string) => void;
}

function GrupoBotones({
  titulo,
  items,
  onSelect,
}: {
  titulo: string;
  items: { id: string; label: string; etiquetaTicket: string }[];
  onSelect: (etiqueta: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
        {titulo}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.etiquetaTicket)}
            className="rounded-xl border-2 border-border bg-background px-3 py-2 text-left text-xs font-bold active:scale-95"
          >
            <span className="font-mono text-accent">{item.etiquetaTicket}</span>
            <span className="mt-0.5 block font-normal text-muted">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CafesFrecuentesGrid({ onSelect }: CafesFrecuentesGridProps) {
  return (
    <div className="space-y-4">
      <GrupoBotones
        titulo="Cafés"
        items={OPCIONES_CAFE}
        onSelect={onSelect}
      />

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
          Carajillos
        </p>
        <div className="flex flex-wrap gap-2">
          {SABORES_CARAJILLO.map((sabor) => (
            <button
              key={sabor}
              type="button"
              onClick={() => onSelect(etiquetaCarajillo(sabor))}
              className="rounded-xl border-2 border-border bg-background px-3 py-2 text-xs font-bold capitalize active:scale-95"
            >
              {etiquetaCarajillo(sabor)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
          Infusiones
        </p>
        <div className="flex flex-wrap gap-2">
          {INFUSIONES.map((infusion) => (
            <button
              key={infusion}
              type="button"
              onClick={() => onSelect(infusion)}
              className="rounded-xl border-2 border-border bg-background px-3 py-2 text-xs font-bold capitalize active:scale-95"
            >
              {infusion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
