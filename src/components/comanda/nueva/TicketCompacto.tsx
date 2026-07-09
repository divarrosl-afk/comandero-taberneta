"use client";

import { platoTieneContenido } from "@/lib/comanda/plato-factory";
import type { PlatoFormItem } from "@/types/comanda";

interface TicketCompactoProps {
  platos: PlatoFormItem[];
  expandido: boolean;
  onToggle: () => void;
  onEditarPlato: (plato: PlatoFormItem) => void;
}

export function TicketCompacto({
  platos,
  expandido,
  onToggle,
  onEditarPlato,
}: TicketCompactoProps) {
  const items = platos.filter(platoTieneContenido);
  if (items.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border-2 border-primary/20 bg-primary/5 p-2">
      <button
        type="button"
        onClick={onToggle}
        className="mb-2 flex w-full items-center justify-between gap-2 text-left text-sm font-bold text-primary"
      >
        <span>Ticket ({items.length})</span>
        <span className="text-xs font-semibold text-muted">
          {expandido ? "Ocultar ▲" : "Ver líneas ▼"}
        </span>
      </button>
      <div className="flex flex-wrap gap-1.5">
        {items.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onEditarPlato(p)}
            className="rounded-lg border border-primary/20 bg-card px-2 py-1 text-xs font-semibold text-foreground shadow-sm transition active:scale-95 hover:border-primary/50"
          >
            {p.nombre}
            {p.cantidad > 1 ? ` x${p.cantidad}` : ""}
            {p.modificaciones.length > 0 && (
              <span className="ml-1 text-muted">+{p.modificaciones.length}</span>
            )}
          </button>
        ))}
      </div>
      {!expandido && (
        <p className="mt-2 text-[11px] text-muted">Toca una línea para editarla</p>
      )}
    </div>
  );
}
