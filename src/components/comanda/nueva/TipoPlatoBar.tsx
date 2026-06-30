"use client";

import { TIPOS_PLATO, SUPLEMENTOS_RAPIDOS } from "@/data/comanda-catalogo";
import { Chip } from "@/components/ui/Chip";
import type { TipoPlatoSeleccion } from "@/types/comanda";

interface TipoPlatoBarProps {
  value?: TipoPlatoSeleccion;
  suplemento?: number;
  onChangeTipo: (value: TipoPlatoSeleccion) => void;
  onChangeSuplemento: (valor: number) => void;
}

export function TipoPlatoBar({
  value,
  suplemento,
  onChangeTipo,
  onChangeSuplemento,
}: TipoPlatoBarProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Tipo de plato
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TIPOS_PLATO.map((tipo) => (
          <Chip
            key={tipo.id}
            label={tipo.labelCorto}
            active={value === tipo.id}
            onClick={() => onChangeTipo(tipo.id)}
            size="sm"
            variant={tipo.id.includes("carta") ? "accent" : "default"}
          />
        ))}
      </div>

      {value === "menu_suplemento" && (
        <div className="flex flex-wrap gap-2">
          <span className="self-center text-xs font-semibold text-muted">+€</span>
          {SUPLEMENTOS_RAPIDOS.map((importe) => (
            <Chip
              key={importe}
              label={`+${importe}€`}
              active={suplemento === importe}
              onClick={() => onChangeSuplemento(importe)}
              size="sm"
            />
          ))}
        </div>
      )}
    </div>
  );
}
