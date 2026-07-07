"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CamareroAccesosBar } from "@/components/navigation/CamareroAccesosBar";
import {
  estiloMesaOperativa,
  labelMesaOperativa,
  type MesaOperativa,
} from "@/types/mesas";
import { contadorTicketsMesaVisible } from "@/lib/mesas/estado-mesa";

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
  const ticketsVisibles = contadorTicketsMesaVisible(mesa.id, mesa.estadoPanel);

  return (
    <article
      className={[
        "rounded-xl border-2 bg-card p-3 transition",
        estiloMesaOperativa(mesa),
      ].join(" ")}
    >
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 text-left"
        >
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold leading-tight">{mesa.nombreVisible}</p>
            {ticketsVisibles > 0 && (
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-bold">
                {ticketsVisibles}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold opacity-90">
            {labelMesaOperativa(mesa)}
          </p>
        </button>

        <CamareroAccesosBar
          mesaId={mesa.id}
          layout="grid"
          className="w-[8.25rem] shrink-0 sm:w-[9rem]"
        />
      </div>

      {expandido && (
        <div className="mt-3 space-y-2 border-t border-black/10 pt-3">
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
              Mesa libre
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
