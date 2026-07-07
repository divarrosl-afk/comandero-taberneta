"use client";

import { useEffect } from "react";
import { CamareroAccesosBar } from "@/components/navigation/CamareroAccesosBar";
import { useMesasOperativas } from "@/hooks/useMesas";
import { contadorTicketsMesaVisible } from "@/lib/mesas/estado-mesa";
import { fetchOperativaData } from "@/lib/sync/operativa-fetch";
import { usesRemoteData } from "@/lib/data/backend";
import {
  estiloMesaOperativa,
  labelMesaOperativa,
  labelZona,
  ZONAS_MESA,
  type MesaOperativa,
  type ZonaMesa,
} from "@/types/mesas";

interface MesaSelectorProps {
  mesaSeleccionada: string | null;
  onSelect: (mesaId: string) => void;
  compact?: boolean;
  zonaFiltro?: ZonaMesa;
}

export function MesaSelector({
  mesaSeleccionada,
  onSelect,
  compact = false,
  zonaFiltro,
}: MesaSelectorProps) {
  const { operativas, porZona, cargando, refrescar, operativaRevision } =
    useMesasOperativas();

  useEffect(() => {
    if (!usesRemoteData()) return;
    void fetchOperativaData().then(() => refrescar());
  }, [refrescar]);

  const zonas = zonaFiltro
    ? [{ id: zonaFiltro, label: labelZona(zonaFiltro) }]
    : ZONAS_MESA;

  const mesasVisibles = zonaFiltro
    ? porZona(zonaFiltro)
    : operativas.sort(
        (a, b) =>
          ZONAS_MESA.findIndex((z) => z.id === a.zona) -
            ZONAS_MESA.findIndex((z) => z.id === b.zona) ||
          a.orden - b.orden ||
          a.codigo.localeCompare(b.codigo, "es"),
      );

  if (cargando && mesasVisibles.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">
        Cargando mesas…
      </p>
    );
  }

  if (mesasVisibles.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">
        No hay mesas activas. Configura las mesas en Ajustes.
      </p>
    );
  }

  const listaClass = compact ? "space-y-2" : "space-y-2";

  return (
    <div className={compact ? "" : "space-y-4"}>
      {!compact && <h2 className="text-base font-bold uppercase">Mesa</h2>}

      {zonaFiltro ? (
        <div className={listaClass}>
          {mesasVisibles.map((mesa) => (
            <MesaFilaSelector
              key={mesa.id}
              mesa={mesa}
              seleccionada={mesaSeleccionada === mesa.id}
              compact={compact}
              operativaRevision={operativaRevision}
              onSelect={() => onSelect(mesa.id)}
            />
          ))}
        </div>
      ) : (
        zonas.map((zona) => {
          const lista = porZona(zona.id);
          if (lista.length === 0) return null;
          return (
            <div key={zona.id} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {zona.label}
              </p>
              <div className={listaClass}>
                {lista.map((mesa) => (
                  <MesaFilaSelector
                    key={mesa.id}
                    mesa={mesa}
                    seleccionada={mesaSeleccionada === mesa.id}
                    compact={compact}
                    operativaRevision={operativaRevision}
                    onSelect={() => onSelect(mesa.id)}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function MesaFilaSelector({
  mesa,
  seleccionada,
  compact,
  operativaRevision,
  onSelect,
}: {
  mesa: MesaOperativa;
  seleccionada: boolean;
  compact: boolean;
  operativaRevision: number;
  onSelect: () => void;
}) {
  void operativaRevision;
  const ticketsVisibles = contadorTicketsMesaVisible(mesa.id, mesa.estadoPanel);

  return (
    <div
      className={[
        "flex items-stretch gap-2 rounded-xl border-2 p-2 transition",
        estiloMesaOperativa(mesa),
        seleccionada ? "ring-2 ring-primary ring-offset-2" : "",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className={compact ? "text-sm font-bold" : "text-base font-bold"}>
            {mesa.nombreVisible}
          </span>
          {ticketsVisibles > 0 && (
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold">
              {ticketsVisibles}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold leading-tight opacity-90">
          {labelMesaOperativa(mesa)}
        </span>
      </button>

      <CamareroAccesosBar
        mesaId={mesa.id}
        layout="grid"
        className="w-[8.25rem] shrink-0 sm:w-[9rem]"
      />
    </div>
  );
}
