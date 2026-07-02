"use client";

import { getEstadoXCafeLabel, getEstadoXLabel } from "@/data/postres-catalogo";
import { formatHora } from "@/lib/historial/items";
import { resolveNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import { EstadoPanelBadge } from "@/components/panel/EstadoPanelBadge";
import { SemaforoPanelSelector } from "@/components/panel/SemaforoPanelSelector";
import type { EstadoPanel } from "@/types/panel";
import type { ComandaPostres } from "@/types/postres";
import type { MesaConfig } from "@/types/mesas";

interface PanelPostresCardProps {
  comanda: ComandaPostres;
  mesas?: MesaConfig[];
  onCambiarEstado: (estado: EstadoPanel) => void;
}

export function PanelPostresCard({
  comanda,
  mesas = [],
  onCambiarEstado,
}: PanelPostresCardProps) {
  const nombreMesa = resolveNombreMesaComanda(comanda, mesas);

  return (
    <article className="rounded-2xl border-2 border-border bg-card p-4 shadow-sm">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-2xl font-bold text-primary">{nombreMesa}</p>
          <p className="text-sm font-medium text-muted">
            {comanda.camarero} · {formatHora(comanda.creadaEn)}
          </p>
        </div>
        <EstadoPanelBadge estado={comanda.estadoPanel} />
      </header>

      <div className="mb-4 space-y-3 rounded-xl bg-background p-3">
        {(comanda.postres.length > 0 || comanda.estadoX) && (
          <div className="space-y-2">
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
            {comanda.estadoX && (
              <p className="text-sm font-semibold">
                X: {getEstadoXLabel(comanda.estadoX)}
              </p>
            )}
          </div>
        )}

        {(comanda.cafes?.length > 0 || comanda.estadoXCafe || comanda.clH) && (
          <div className="space-y-2 border-t border-border pt-2">
            <p className="text-xs font-bold uppercase tracking-wide text-accent">
              Cafés
            </p>
            {comanda.estadoXCafe && (
              <p className="text-sm font-semibold">
                X: {getEstadoXCafeLabel(comanda.estadoXCafe)}
              </p>
            )}
            <ul className="space-y-1">
              {(comanda.cafes ?? []).map((c) => (
                <li key={c.id} className="text-sm">
                  · {c.nombre}
                  {c.cantidad > 1 && ` x${c.cantidad}`}
                  {c.nota && ` · ${c.nota}`}
                </li>
              ))}
            </ul>
            {comanda.clH && <p className="text-sm font-semibold">C/L + H</p>}
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

      <SemaforoPanelSelector
        value={comanda.estadoPanel}
        onChange={onCambiarEstado}
      />
    </article>
  );
}
