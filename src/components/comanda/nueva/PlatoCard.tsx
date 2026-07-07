"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ModificacionesChips } from "@/components/comanda/nueva/ModificacionesChips";
import { SalsasSelector } from "@/components/comanda/nueva/SalsasSelector";
import { TipoPlatoBar } from "@/components/comanda/nueva/TipoPlatoBar";
import { platoTieneContenido } from "@/lib/comanda/plato-factory";
import type { ModificacionId, PlatoFormItem } from "@/types/comanda";

interface PlatoCardProps {
  plato: PlatoFormItem;
  indice: number;
  conTipo?: boolean;
  enfocado?: boolean;
  onChange: (cambios: Partial<PlatoFormItem>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onToggleModificacion: (mod: ModificacionId) => void;
  onCycleSalsa: (salsaId: string, nombre: string) => void;
  onColapsar?: () => void;
}

export function PlatoCard({
  plato,
  indice,
  conTipo = false,
  enfocado = false,
  onChange,
  onRemove,
  onDuplicate,
  onToggleModificacion,
  onCycleSalsa,
  onColapsar,
}: PlatoCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expandido, setExpandido] = useState(true);
  const tieneContenido = platoTieneContenido(plato);

  useEffect(() => {
    if (enfocado) setExpandido(true);
  }, [enfocado]);

  const resumen =
    plato.nombre.trim() ||
    `Plato ${indice + 1}${plato.cantidad > 1 ? ` x${plato.cantidad}` : ""}`;

  const toggleExpandido = () => {
    setExpandido((v) => {
      if (v) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => onColapsar?.());
        });
      }
      return !v;
    });
  };

  return (
    <>
      <article
        data-plato-card={plato.id}
        className={[
          "scroll-mt-28 overflow-hidden rounded-2xl border-2 bg-background transition-shadow",
          enfocado ? "border-primary shadow-md ring-2 ring-primary/30" : "border-border",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={toggleExpandido}
          className="flex w-full items-center justify-between gap-2 bg-card px-3 py-3 text-left"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              {tieneContenido ? plato.nombre : `Plato ${indice + 1}`}
              {plato.cantidad > 1 && (
                <span className="ml-1 text-accent">x{plato.cantidad}</span>
              )}
            </p>
            {(plato.modificaciones.length > 0 || plato.salsas.length > 0) && (
              <p className="truncate text-xs text-muted">
                {plato.modificaciones.length} mod. · {plato.salsas.length} salsas
              </p>
            )}
          </div>
          <span className="text-muted">{expandido ? "▲" : "▼"}</span>
        </button>

        {expandido && (
          <div className="space-y-4 border-t border-border p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={plato.nombre}
                onChange={(e) => onChange({ nombre: e.target.value })}
                placeholder="Nombre del plato"
                className="min-h-14 flex-1 rounded-xl border-2 border-border bg-card px-3 text-lg font-medium outline-none focus:border-primary"
                autoComplete="off"
              />
              <QuantityStepper
                value={plato.cantidad}
                onChange={(cantidad) => onChange({ cantidad })}
              />
            </div>

            {conTipo && (
              <TipoPlatoBar
                value={plato.tipoSeleccion}
                suplemento={plato.suplemento}
                onChangeTipo={(tipoSeleccion) => onChange({ tipoSeleccion })}
                onChangeSuplemento={(suplemento) => onChange({ suplemento })}
              />
            )}

            <ModificacionesChips
              seleccionadas={plato.modificaciones}
              onToggle={onToggleModificacion}
            />

            <SalsasSelector salsas={plato.salsas} onCycle={onCycleSalsa} />

            <input
              type="text"
              value={plato.notaLibre ?? ""}
              onChange={(e) => onChange({ notaLibre: e.target.value })}
              placeholder="Nota libre (opcional)"
              className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 text-sm outline-none focus:border-primary"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={onDuplicate}
              >
                Duplicar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => setConfirmDelete(true)}
                className="text-red-600"
              >
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </article>

      <ConfirmDialog
        open={confirmDelete}
        title="¿Eliminar plato?"
        message={`Se eliminará "${resumen}" de la comanda.`}
        confirmLabel="Eliminar"
        onConfirm={() => {
          onRemove();
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
