"use client";

import { camareros } from "@/data/camareros";

interface CamareroSelectorProps {
  camareroSeleccionado: string | null;
  onSelect: (camareroId: string) => void;
}

export function CamareroSelector({
  camareroSeleccionado,
  onSelect,
}: CamareroSelectorProps) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Camarero</h2>
      <div className="grid grid-cols-2 gap-2">
        {camareros
          .filter((c) => c.activo)
          .map((camarero) => {
            const activo = camareroSeleccionado === camarero.id;
            return (
              <button
                key={camarero.id}
                type="button"
                onClick={() => onSelect(camarero.id)}
                className={[
                  "flex min-h-14 items-center justify-center rounded-xl px-3 text-base font-semibold transition active:scale-95",
                  activo
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "border-2 border-border bg-card text-foreground hover:border-primary/40",
                ].join(" ")}
              >
                {camarero.nombre}
              </button>
            );
          })}
      </div>
    </section>
  );
}
