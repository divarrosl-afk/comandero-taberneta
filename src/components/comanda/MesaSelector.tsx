"use client";

import { useEffect } from "react";
import { useMesasOperativas } from "@/hooks/useMesas";
import { getComandasDeMesa } from "@/lib/mesas/estado-mesa";
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

  const gridClass = compact
    ? "grid grid-cols-2 gap-2 sm:grid-cols-3"
    : "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4";

  return (
    <div className={compact ? "" : "space-y-4"}>
      {!compact && <h2 className="text-base font-bold uppercase">Mesa</h2>}

      {zonaFiltro ? (
        <div className={gridClass}>
          {mesasVisibles.map((mesa) => (
            <MesaBotonOperativa
              key={mesa.id}
              mesa={mesa}
              seleccionada={mesaSeleccionada === mesa.id}
              compact={compact}
              operativaRevision={operativaRevision}
              onClick={() => onSelect(mesa.id)}
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
              <div className={gridClass}>
                {lista.map((mesa) => (
                  <MesaBotonOperativa
                    key={mesa.id}
                    mesa={mesa}
                    seleccionada={mesaSeleccionada === mesa.id}
                    compact={compact}
                    operativaRevision={operativaRevision}
                    onClick={() => onSelect(mesa.id)}
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

function MesaBotonOperativa({
  mesa,
  seleccionada,
  compact,
  operativaRevision,
  onClick,
}: {
  mesa: MesaOperativa;
  seleccionada: boolean;
  compact: boolean;
  operativaRevision: number;
  onClick: () => void;
}) {
  void operativaRevision;
  const { activas } = getComandasDeMesa(mesa.id);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex flex-col items-center justify-center rounded-xl border-2 px-2 py-2 font-bold transition active:scale-95",
        compact ? "min-h-14" : "min-h-16",
        estiloMesaOperativa(mesa),
        seleccionada ? "ring-2 ring-primary ring-offset-2" : "",
      ].join(" ")}
    >
      {activas > 0 && (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold">
          {activas}
        </span>
      )}
      <span className={compact ? "text-sm" : "text-base"}>{mesa.nombreVisible}</span>
      <span className="mt-0.5 text-center text-[10px] font-semibold leading-tight opacity-90">
        {labelMesaOperativa(mesa)}
      </span>
    </button>
  );
}
