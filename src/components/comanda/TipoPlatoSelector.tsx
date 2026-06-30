"use client";

import type { TipoPlatoSeleccion } from "@/types/comanda";

const OPCIONES: { value: TipoPlatoSeleccion; label: string }[] = [
  { value: "menu", label: "MENÚ" },
  { value: "menu_suplemento", label: "MENÚ + SUP." },
  { value: "carta", label: "CARTA" },
  { value: "carta_primero", label: "CARTA → 1º" },
  { value: "carta_segundo", label: "CARTA → 2º" },
];

interface TipoPlatoSelectorProps {
  value?: TipoPlatoSeleccion;
  onChange: (value: TipoPlatoSeleccion) => void;
}

export function TipoPlatoSelector({ value, onChange }: TipoPlatoSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {OPCIONES.map((opcion) => {
        const activa = value === opcion.value;
        return (
          <button
            key={opcion.value}
            type="button"
            onClick={() => onChange(opcion.value)}
            className={[
              "min-h-11 rounded-lg px-2 text-xs font-bold tracking-wide transition active:scale-95 sm:text-sm",
              activa
                ? "bg-accent text-white shadow-sm"
                : "border border-border bg-background text-foreground",
            ].join(" ")}
          >
            {opcion.label}
          </button>
        );
      })}
    </div>
  );
}
