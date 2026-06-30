"use client";

import { camareros } from "@/data/camareros";

interface CamareroSelectorProps {
  camareroSeleccionado: string | null;
  onSelect: (camareroId: string) => void;
  compact?: boolean;
  soloLectura?: boolean;
}

export function CamareroSelector({
  camareroSeleccionado,
  onSelect,
  compact = false,
  soloLectura = false,
}: CamareroSelectorProps) {
  const activos = camareros.filter((c) => c.activo);

  if (soloLectura && camareroSeleccionado) {
    const camarero = activos.find((c) => c.id === camareroSeleccionado);
    return (
      <div className={compact ? "" : "space-y-3"}>
        {!compact && (
          <h2 className="text-base font-bold uppercase">Camarero</h2>
        )}
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-3">
          <p className="text-lg font-bold text-primary">
            {camarero?.nombre ?? camareroSeleccionado}
          </p>
          <p className="mt-1 text-sm text-muted">
            Asignado a tu usuario de sesión
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "space-y-3"}>
      {!compact && <h2 className="text-base font-bold uppercase">Camarero</h2>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {activos.map((camarero) => {
            const activo = camareroSeleccionado === camarero.id;
            return (
              <button
                key={camarero.id}
                type="button"
                onClick={() => onSelect(camarero.id)}
                className={[
                  "flex items-center justify-center rounded-xl px-2 font-semibold transition active:scale-95",
                  compact ? "min-h-12 text-sm" : "min-h-14 text-base",
                  activo
                    ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                    : "border-2 border-border bg-card hover:border-primary/40",
                ].join(" ")}
              >
                {camarero.nombre}
              </button>
            );
          })}
      </div>
    </div>
  );
}
