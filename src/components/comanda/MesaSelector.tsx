"use client";

import { useMesas } from "@/hooks/useMesas";
import { labelZona, ZONAS_MESA, type ZonaMesa } from "@/types/mesas";

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
  const { activas, porZona } = useMesas();

  const zonas = zonaFiltro
    ? [{ id: zonaFiltro, label: labelZona(zonaFiltro) }]
    : ZONAS_MESA;

  const mesasVisibles = zonaFiltro
    ? porZona(zonaFiltro)
    : activas.sort(
        (a, b) =>
          ZONAS_MESA.findIndex((z) => z.id === a.zona) -
            ZONAS_MESA.findIndex((z) => z.id === b.zona) ||
          a.orden - b.orden ||
          a.codigo.localeCompare(b.codigo, "es"),
      );

  if (mesasVisibles.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">
        No hay mesas activas. Configura las mesas en Ajustes.
      </p>
    );
  }

  return (
    <div className={compact ? "" : "space-y-4"}>
      {!compact && <h2 className="text-base font-bold uppercase">Mesa</h2>}

      {zonaFiltro ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {mesasVisibles.map((mesa) => (
            <MesaBoton
              key={mesa.id}
              codigo={mesa.nombreVisible}
              activa={mesaSeleccionada === mesa.id}
              compact={compact}
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
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {lista.map((mesa) => (
                  <MesaBoton
                    key={mesa.id}
                    codigo={mesa.nombreVisible}
                    activa={mesaSeleccionada === mesa.id}
                    compact={compact}
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

function MesaBoton({
  codigo,
  activa,
  compact,
  onClick,
}: {
  codigo: string;
  activa: boolean;
  compact: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center justify-center rounded-xl font-bold transition active:scale-95",
        compact ? "min-h-12 text-sm" : "min-h-14 text-base",
        activa
          ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
          : "border-2 border-border bg-card hover:border-primary/40",
      ].join(" ")}
    >
      {codigo}
    </button>
  );
}
