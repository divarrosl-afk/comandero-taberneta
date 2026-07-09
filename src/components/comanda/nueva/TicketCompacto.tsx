"use client";

import { platoTieneContenido } from "@/lib/comanda/plato-factory";
import type { PlatoFormItem } from "@/types/comanda";

interface TicketCompactoProps {
  platos: PlatoFormItem[];
  activoId?: string | null;
  onEditarPlato: (plato: PlatoFormItem) => void;
}

export function TicketCompacto({
  platos,
  activoId,
  onEditarPlato,
}: TicketCompactoProps) {
  const items = platos.filter(platoTieneContenido);
  if (items.length === 0) return null;

  return (
    <div className="mb-3 rounded-xl border-2 border-primary/20 bg-primary/5 p-2">
      <p className="mb-2 text-sm font-bold text-primary">Ticket ({items.length})</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onEditarPlato(p)}
            className={[
              "rounded-lg border px-2 py-1 text-xs font-semibold shadow-sm transition active:scale-95",
              p.id === activoId
                ? "border-primary bg-primary text-primary-foreground"
                : "border-primary/20 bg-card text-foreground hover:border-primary/50",
            ].join(" ")}
          >
            {p.nombre}
            {p.cantidad > 1 ? ` x${p.cantidad}` : ""}
            {(p.modificaciones?.length ?? 0) > 0 && (
              <span className="ml-1 opacity-80">
                +{p.modificaciones.reduce((n, m) => n + m.cantidad, 0)}
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted">Toca una línea para editarla</p>
    </div>
  );
}
