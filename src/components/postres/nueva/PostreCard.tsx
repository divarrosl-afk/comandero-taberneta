"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { postreTieneContenido } from "@/lib/postres/postre-factory";
import type { PostreFormItem } from "@/types/postres";

interface PostreCardProps {
  postre: PostreFormItem;
  indice: number;
  onChange: (cambios: Partial<PostreFormItem>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onColapsar?: () => void;
}

export function PostreCard({
  postre,
  indice,
  onChange,
  onRemove,
  onDuplicate,
  onColapsar,
}: PostreCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expandido, setExpandido] = useState(true);
  const tieneContenido = postreTieneContenido(postre);

  const resumen =
    postre.nombre.trim() || `Postre ${indice + 1}`;

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
      <article className="overflow-hidden rounded-2xl border-2 border-border bg-background">
        <button
          type="button"
          onClick={toggleExpandido}
          className="flex w-full items-center justify-between gap-2 bg-card px-3 py-3 text-left"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              {tieneContenido ? postre.nombre : `Postre ${indice + 1}`}
              {postre.cantidad > 1 && (
                <span className="ml-1 text-accent">x{postre.cantidad}</span>
              )}
            </p>
            {postre.nota && (
              <p className="truncate text-xs text-muted">{postre.nota}</p>
            )}
          </div>
          <span className="text-muted">{expandido ? "▲" : "▼"}</span>
        </button>

        {expandido && (
          <div className="space-y-3 border-t border-border p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={postre.nombre}
                onChange={(e) => onChange({ nombre: e.target.value })}
                placeholder="Nombre del postre"
                className="min-h-14 flex-1 rounded-xl border-2 border-border bg-card px-3 text-lg font-medium outline-none focus:border-primary"
                autoComplete="off"
              />
              <QuantityStepper
                value={postre.cantidad}
                onChange={(cantidad) => onChange({ cantidad })}
              />
            </div>

            <input
              type="text"
              value={postre.nota ?? ""}
              onChange={(e) => onChange({ nota: e.target.value })}
              placeholder="Nota opcional (ej: sin nata)"
              className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 text-sm outline-none focus:border-primary"
            />

            <div className="flex gap-2">
              <Button variant="outline" size="sm" fullWidth onClick={onDuplicate}>
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
        title="¿Eliminar postre?"
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
