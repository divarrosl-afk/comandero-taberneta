"use client";

import { getEstadoXLabel } from "@/data/postres-catalogo";
import { formatHora } from "@/lib/historial/items";
import { getNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import { EstadoPanelBadge } from "@/components/panel/EstadoPanelBadge";
import { EstadoPanelSelector } from "@/components/panel/EstadoPanelSelector";
import type { EstadoPanel } from "@/types/panel";
import type { ComandaPostres } from "@/types/postres";

interface PanelPostresCardProps {
  comanda: ComandaPostres;
  onCambiarEstado: (estado: EstadoPanel) => void;
}

export function PanelPostresCard({
  comanda,
  onCambiarEstado,
}: PanelPostresCardProps) {
  return (
    <article className="rounded-2xl border-2 border-border bg-card p-4 shadow-sm">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-2xl font-bold text-primary">
            MESA {getNombreMesaComanda(comanda)}
          </p>
          <p className="text-sm font-medium text-muted">
            {comanda.camarero} · {formatHora(comanda.creadaEn)}
          </p>
        </div>
        <EstadoPanelBadge estado={comanda.estadoPanel} />
      </header>

      <div className="mb-4 space-y-2 rounded-xl bg-background p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-accent">
          Postres
        </p>
        <ul className="space-y-1">
          {comanda.postres.map((p) => (
            <li key={p.id} className="text-sm">
              · {p.nombre}
              {p.cantidad > 1 && ` x${p.cantidad}`}
              {p.nota && ` · ${p.nota}`}
            </li>
          ))}
        </ul>

        {(comanda.estadoX || comanda.clH) && (
          <div className="mt-2 border-t border-border pt-2 text-sm">
            <p className="font-mono text-muted">---------</p>
            {comanda.estadoX && (
              <p className="font-semibold">X: {getEstadoXLabel(comanda.estadoX)}</p>
            )}
            {comanda.clH && <p className="font-semibold">C/L + H</p>}
          </div>
        )}

        {comanda.observaciones.length > 0 && (
          <div className="mt-2 border-t border-border pt-2">
            <p className="text-xs font-bold uppercase text-accent">Observaciones</p>
            {comanda.observaciones.map((o, i) => (
              <p key={i} className="text-sm">
                · {o}
              </p>
            ))}
          </div>
        )}
      </div>

      <EstadoPanelSelector
        value={comanda.estadoPanel}
        onChange={onCambiarEstado}
        compact
      />
    </article>
  );
}
