"use client";

import { formatFechaHora } from "@/lib/historial/items";
import { getEstadoPanelLabel } from "@/types/panel";
import type { EntradaCierre } from "@/types/cierre";

interface ListaEntradasCierreProps {
  entradas: EntradaCierre[];
}

export function ListaEntradasCierre({ entradas }: ListaEntradasCierreProps) {
  if (entradas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
        No hay tickets con los filtros seleccionados.
      </p>
    );
  }

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
        Tickets ({entradas.length})
      </h2>
      <ul className="space-y-2">
        {entradas.map((e) => (
          <li
            key={`${e.tipo}-${e.id}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
              {e.mesa}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-xs font-bold uppercase",
                    e.tipo === "cocina"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-purple-100 text-purple-800",
                  ].join(" ")}
                >
                  {e.tipo === "cocina" ? "Cocina" : "Postres"}
                </span>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs font-semibold">
                  {getEstadoPanelLabel(e.estadoPanel)}
                </span>
              </div>
              <p className="mt-1 truncate font-semibold">{e.camarero}</p>
              <p className="text-xs text-muted">
                {formatFechaHora(e.creadaEn)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
