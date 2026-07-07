"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  estiloMesaOperativa,
  labelMesaOperativa,
  type MesaOperativa,
} from "@/types/mesas";
import { getComandasDeMesa, contadorTicketsMesaVisible } from "@/lib/mesas/estado-mesa";
import { isEstadoPanelActivo } from "@/types/panel";

interface MesaCardProps {
  mesa: MesaOperativa;
  operativaRevision: number;
  onToggleCobrando: () => void;
  onLiberar: () => void | Promise<void>;
}

export function MesaCard({
  mesa,
  operativaRevision,
  onToggleCobrando,
  onLiberar,
}: MesaCardProps) {
  const [expandido, setExpandido] = useState(false);
  void operativaRevision;
  const { cocina } = getComandasDeMesa(mesa.id);
  const ticketsVisibles = contadorTicketsMesaVisible(mesa.id, mesa.estadoPanel);
  const comandasCocinaActivas = cocina.filter((c) =>
    isEstadoPanelActivo(c.estadoPanel),
  ).length;
  const tieneComanda = comandasCocinaActivas > 0;
  const panelHref = `/panel?mesa=${encodeURIComponent(mesa.id)}`;
  const panelPostresHref = `/panel?mesa=${encodeURIComponent(mesa.id)}&tab=postres`;

  return (
    <article
      className={[
        "rounded-xl border-2 bg-card p-3 transition",
        estiloMesaOperativa(mesa),
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <div>
          <p className="text-lg font-bold">{mesa.nombreVisible}</p>
          <p className="text-xs font-semibold opacity-90">
            {labelMesaOperativa(mesa)}
          </p>
        </div>
        {ticketsVisibles > 0 && (
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-bold">
            {ticketsVisibles}
          </span>
        )}
      </button>

      {expandido && (
        <div className="mt-3 space-y-2 border-t border-black/10 pt-3">
          <div className="grid grid-cols-2 gap-2">
            {tieneComanda ? (
              <Link
                href={panelHref}
                className="flex min-h-11 items-center justify-center rounded-xl bg-primary px-2 text-center text-xs font-bold text-primary-foreground"
              >
                Ver comanda ({comandasCocinaActivas})
              </Link>
            ) : (
              <Link
                href={`/comanda/nueva?mesa=${encodeURIComponent(mesa.id)}`}
                className="flex min-h-11 items-center justify-center rounded-xl bg-primary px-2 text-center text-xs font-bold text-primary-foreground"
              >
                Nueva comanda
              </Link>
            )}
            <Link
              href={tieneComanda ? panelPostresHref : `/postres/nuevo?mesa=${encodeURIComponent(mesa.id)}`}
              className="flex min-h-11 items-center justify-center rounded-xl border-2 border-border bg-background px-2 text-center text-xs font-bold"
            >
              Postres
            </Link>
          </div>
          {tieneComanda && (
            <Link
              href={`/comanda/nueva?mesa=${encodeURIComponent(mesa.id)}`}
              className="flex min-h-9 w-full items-center justify-center rounded-xl border border-dashed border-border text-xs font-medium text-muted"
            >
              + Otra comanda
            </Link>
          )}
          <div className="flex gap-2">
            <Button
              variant={mesa.estado === "cobrando" ? "primary" : "outline"}
              size="sm"
              fullWidth
              onClick={onToggleCobrando}
            >
              {mesa.estado === "cobrando" ? "✓ Cobrando" : "Cobrando"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => {
                void Promise.resolve(onLiberar());
              }}
            >
              Liberar
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
