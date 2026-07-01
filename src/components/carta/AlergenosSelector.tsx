"use client";

import { ALERGENOS, type AlergenoId } from "@/types/catalogo";

interface AlergenosSelectorProps {
  seleccionados: AlergenoId[];
  onChange: (alergenos: AlergenoId[]) => void;
  compact?: boolean;
}

export function AlergenosSelector({
  seleccionados,
  onChange,
  compact = false,
}: AlergenosSelectorProps) {
  const toggle = (id: AlergenoId) => {
    if (seleccionados.includes(id)) {
      onChange(seleccionados.filter((a) => a !== id));
    } else {
      onChange([...seleccionados, id]);
    }
  };

  return (
    <div className="space-y-2">
      {!compact && (
        <p className="text-xs font-semibold uppercase text-muted">Alérgenos</p>
      )}
      <div className="flex flex-wrap gap-2">
        {ALERGENOS.map((a) => {
          const activo = seleccionados.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggle(a.id)}
              className={[
                "rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition active:scale-95",
                activo
                  ? "border-red-300 bg-red-50 text-red-800"
                  : "border-border bg-card text-foreground",
              ].join(" ")}
            >
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
