"use client";

import { mesas } from "@/data/mesas";

interface MesaSelectorProps {
  mesaSeleccionada: number | null;
  onSelect: (mesa: number) => void;
}

export function MesaSelector({ mesaSeleccionada, onSelect }: MesaSelectorProps) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Mesa</h2>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {mesas.map((mesa) => {
          const activa = mesaSeleccionada === mesa;
          return (
            <button
              key={mesa}
              type="button"
              onClick={() => onSelect(mesa)}
              className={[
                "flex min-h-14 items-center justify-center rounded-xl text-lg font-bold transition active:scale-95",
                activa
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "border-2 border-border bg-card text-foreground hover:border-primary/40",
              ].join(" ")}
            >
              {mesa}
            </button>
          );
        })}
      </div>
    </section>
  );
}
