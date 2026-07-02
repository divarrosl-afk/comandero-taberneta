"use client";

import { formatHora } from "@/lib/historial/items";
import { lineasMarchaPostres } from "@/lib/panel/resumen-marcha";
import { resolveNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import {
  getEstadoPanelLabel,
  getEstadoPanelStyle,
} from "@/types/panel";
import type { MesaConfig } from "@/types/mesas";
import type { ComandaPostres } from "@/types/postres";

interface PanelPostresTileProps {
  comanda: ComandaPostres;
  mesas: MesaConfig[];
  onClick: () => void;
}

export function PanelPostresTile({
  comanda,
  mesas,
  onClick,
}: PanelPostresTileProps) {
  const nombreMesa = resolveNombreMesaComanda(comanda, mesas);
  const lineas = lineasMarchaPostres(comanda, 3);
  const estilo = getEstadoPanelStyle(comanda.estadoPanel);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-h-[9.5rem] flex-col rounded-2xl border-2 p-3 text-left shadow-sm transition active:scale-[0.98]",
        estilo,
      ].join(" ")}
    >
      <div className="mb-1 flex items-start justify-between gap-1">
        <p className="text-xl font-bold leading-tight">{nombreMesa}</p>
        <span className="shrink-0 text-[10px] font-semibold opacity-80">
          {formatHora(comanda.creadaEn)}
        </span>
      </div>

      <p className="mb-2 text-xs font-bold uppercase tracking-wide">
        {getEstadoPanelLabel(comanda.estadoPanel)}
      </p>

      <ul className="flex-1 space-y-0.5 overflow-hidden">
        {lineas.map((linea, i) => (
          <li key={i} className="truncate text-xs font-medium leading-snug">
            · {linea}
          </li>
        ))}
      </ul>
    </button>
  );
}
