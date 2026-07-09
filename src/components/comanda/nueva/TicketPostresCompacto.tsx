"use client";

import { postreTieneContenido } from "@/lib/postres/postre-factory";
import type { PostreFormItem } from "@/types/postres";

interface TicketPostresCompactoProps {
  items: PostreFormItem[];
  activoId?: string | null;
  etiqueta?: string;
  onEditar: (item: PostreFormItem) => void;
}

export function TicketPostresCompacto({
  items,
  activoId,
  etiqueta = "Ticket",
  onEditar,
}: TicketPostresCompactoProps) {
  const lineas = items.filter(postreTieneContenido);
  if (lineas.length === 0) return null;

  return (
    <div className="mb-3 rounded-xl border-2 border-primary/20 bg-primary/5 p-2">
      <p className="mb-2 text-sm font-bold text-primary">
        {etiqueta} ({lineas.length})
      </p>
      <div className="flex flex-wrap gap-1.5">
        {lineas.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onEditar(p)}
            className={[
              "rounded-lg border px-2 py-1 text-xs font-semibold shadow-sm transition active:scale-95",
              p.id === activoId
                ? "border-primary bg-primary text-primary-foreground"
                : "border-primary/20 bg-card text-foreground hover:border-primary/50",
            ].join(" ")}
          >
            {p.nombre}
            {(p.cantidad ?? 1) > 1 ? ` x${p.cantidad}` : ""}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted">Toca una línea para editarla</p>
    </div>
  );
}
