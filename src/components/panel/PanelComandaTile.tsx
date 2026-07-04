"use client";

import { formatHora } from "@/lib/historial/items";
import { lineasMarchaCocina } from "@/lib/panel/resumen-marcha";
import { resolveNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import {
  getEstadoPanelLabel,
  getEstadoPanelStyle,
} from "@/types/panel";
import type { ComandaCocina } from "@/types/comanda";
import type { MesaConfig } from "@/types/mesas";
import type { ComandaPostres } from "@/types/postres";

interface PanelComandaTileProps {
  comanda: ComandaCocina;
  mesas: MesaConfig[];
  postresMesa?: ComandaPostres;
  onClick: () => void;
  compacto?: boolean;
}

export function PanelComandaTile({
  comanda,
  mesas,
  postresMesa,
  onClick,
  compacto = false,
}: PanelComandaTileProps) {
  const nombreMesa = resolveNombreMesaComanda(comanda, mesas);
  const lineas = lineasMarchaCocina(comanda, comanda.estadoPanel, 3);
  const estilo = getEstadoPanelStyle(comanda.estadoPanel);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex flex-col rounded-2xl border-2 p-3 text-left shadow-sm transition active:scale-[0.98]",
        compacto ? "min-h-[8.5rem]" : "min-h-[9.5rem]",
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
        {lineas.length > 0 ? (
          lineas.map((linea, i) => (
            <li key={i} className="truncate text-xs font-medium leading-snug">
              · {linea}
            </li>
          ))
        ) : (
          <li className="text-xs opacity-70">Sin platos en esta fase</li>
        )}
      </ul>

      {postresMesa && (
        <p className="mt-2 truncate text-[10px] font-semibold text-purple-900">
          Postres: {getEstadoPanelLabel(postresMesa.estadoPanel)}
        </p>
      )}
    </button>
  );
}
