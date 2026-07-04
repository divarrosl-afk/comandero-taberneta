"use client";

import { PanelComandaTile } from "@/components/panel/PanelComandaTile";
import {
  agruparComandasEnRieles,
  minutosEspera,
} from "@/lib/panel/orden-tickets-cocina";
import type { ComandaCocina } from "@/types/comanda";
import type { MesaConfig } from "@/types/mesas";
import type { ComandaPostres } from "@/types/postres";

interface PanelCocinaTicketRailsProps {
  comandas: ComandaCocina[];
  mesas: MesaConfig[];
  postresDeMesa: (comanda: ComandaCocina) => ComandaPostres | undefined;
  onAbrir: (comanda: ComandaCocina) => void;
}

function RielTickets({
  titulo,
  subtitulo,
  comandas,
  mesas,
  postresDeMesa,
  onAbrir,
  acento,
}: {
  titulo: string;
  subtitulo: string;
  comandas: ComandaCocina[];
  mesas: MesaConfig[];
  postresDeMesa: (comanda: ComandaCocina) => ComandaPostres | undefined;
  onAbrir: (comanda: ComandaCocina) => void;
  acento: string;
}) {
  return (
    <section
      className={[
        "rounded-2xl border-2 bg-card/80 p-3 shadow-sm",
        acento,
      ].join(" ")}
    >
      <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2 px-1">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide">{titulo}</h2>
          <p className="text-xs text-muted">{subtitulo}</p>
        </div>
        <span className="rounded-full bg-background px-2.5 py-1 text-xs font-bold">
          {comandas.length} ticket{comandas.length === 1 ? "" : "s"}
        </span>
      </header>

      {comandas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-background/60 px-4 py-6 text-center text-sm text-muted">
          Sin tickets en esta barra
        </p>
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-1 -translate-y-1/2 rounded-full bg-border/80" />
          <div className="relative z-10 flex gap-3 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory">
            {comandas.map((comanda, index) => {
              const espera = minutosEspera(comanda.creadaEn);
              return (
                <div
                  key={comanda.id}
                  className="w-[8.75rem] shrink-0 snap-start sm:w-[9.5rem]"
                >
                  <div className="mb-1 flex items-center justify-between gap-1 px-0.5">
                    <span className="text-[10px] font-bold text-muted">
                      #{index + 1}
                    </span>
                    <span
                      className={[
                        "rounded px-1.5 py-0.5 text-[10px] font-bold",
                        espera >= 20
                          ? "bg-red-100 text-red-800"
                          : espera >= 10
                            ? "bg-amber-100 text-amber-900"
                            : "bg-stone-100 text-stone-600",
                      ].join(" ")}
                    >
                      {espera < 1 ? "<1 min" : `${espera} min`}
                    </span>
                  </div>
                  <PanelComandaTile
                    comanda={comanda}
                    mesas={mesas}
                    postresMesa={postresDeMesa(comanda)}
                    onClick={() => onAbrir(comanda)}
                    compacto
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export function PanelCocinaTicketRails({
  comandas,
  mesas,
  postresDeMesa,
  onAbrir,
}: PanelCocinaTicketRailsProps) {
  const { primeros, segundos, postres } = agruparComandasEnRieles(comandas);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
      <p className="text-center text-xs font-medium text-muted">
        Izquierda = llegó antes · derecha = más reciente
      </p>

      <RielTickets
        titulo="Primeros"
        subtitulo="Entrantes, bebidas y 1º — orden de llegada"
        comandas={primeros}
        mesas={mesas}
        postresDeMesa={postresDeMesa}
        onAbrir={onAbrir}
        acento="border-lime-300"
      />

      <RielTickets
        titulo="Segundos"
        subtitulo="Marcha 2º — orden de llegada"
        comandas={segundos}
        mesas={mesas}
        postresDeMesa={postresDeMesa}
        onAbrir={onAbrir}
        acento="border-rose-300"
      />

      <RielTickets
        titulo="Postres"
        subtitulo="Tiene segundos, postres y cafés — orden de llegada"
        comandas={postres}
        mesas={mesas}
        postresDeMesa={postresDeMesa}
        onAbrir={onAbrir}
        acento="border-violet-300"
      />
    </div>
  );
}
