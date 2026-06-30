"use client";

import { Button } from "@/components/ui/Button";
import { TipoPlatoSelector } from "@/components/comanda/TipoPlatoSelector";
import type { PlatoFormItem } from "@/types/comanda";

const NOTAS_RAPIDAS = ["poco hecho", "sin salsa", "sin gluten", "sin cebolla"];

interface PlatoEditorProps {
  plato: PlatoFormItem;
  conTipo?: boolean;
  onChange: (cambios: Partial<PlatoFormItem>) => void;
  onRemove: () => void;
  puedeEliminar: boolean;
}

export function PlatoEditor({
  plato,
  conTipo = false,
  onChange,
  onRemove,
  puedeEliminar,
}: PlatoEditorProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={plato.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
          placeholder="Nombre del plato"
          className="min-h-12 flex-1 rounded-lg border border-border bg-card px-3 text-base outline-none focus:border-primary"
        />
        <div className="flex flex-col items-center rounded-lg border border-border bg-card">
          <button
            type="button"
            onClick={() => onChange({ cantidad: plato.cantidad + 1 })}
            className="flex h-6 w-10 items-center justify-center text-lg font-bold text-primary"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
          <span className="w-10 text-center text-sm font-bold">{plato.cantidad}</span>
          <button
            type="button"
            onClick={() =>
              onChange({ cantidad: Math.max(1, plato.cantidad - 1) })
            }
            className="flex h-6 w-10 items-center justify-center text-lg font-bold text-primary"
            aria-label="Reducir cantidad"
          >
            −
          </button>
        </div>
      </div>

      {conTipo && (
        <div className="mt-3 space-y-3">
          <TipoPlatoSelector
            value={plato.tipoSeleccion}
            onChange={(tipoSeleccion) => onChange({ tipoSeleccion })}
          />

          {plato.tipoSeleccion === "menu_suplemento" && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted">Suplemento €</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={plato.suplemento ?? ""}
                onChange={(e) =>
                  onChange({
                    suplemento: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="5"
                className="min-h-11 w-24 rounded-lg border border-border bg-card px-3 text-base outline-none focus:border-primary"
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-3">
        <input
          type="text"
          value={plato.notasCocina ?? ""}
          onChange={(e) => onChange({ notasCocina: e.target.value })}
          placeholder="Notas de cocina"
          className="min-h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {NOTAS_RAPIDAS.map((nota) => (
            <button
              key={nota}
              type="button"
              onClick={() => onChange({ notasCocina: nota })}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted transition active:scale-95 hover:border-primary/40"
            >
              {nota}
            </button>
          ))}
        </div>
      </div>

      {puedeEliminar && (
        <Button
          variant="ghost"
          onClick={onRemove}
          className="mt-2 min-h-10 w-full text-sm text-red-600"
        >
          Quitar plato
        </Button>
      )}
    </div>
  );
}
