"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface ComandaEditorSheetProps {
  open: boolean;
  title: string;
  subtitle?: string;
  aceptarLabel?: string;
  onClose: () => void;
  onAceptar: () => void;
  children: ReactNode;
}

export function ComandaEditorSheet({
  open,
  title,
  subtitle,
  aceptarLabel = "Aceptar",
  onClose,
  onAceptar,
  children,
}: ComandaEditorSheetProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-2 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[88dvh] w-full max-w-lg flex-col rounded-2xl border-2 border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="comanda-editor-titulo"
      >
        <div className="shrink-0 border-b border-border px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2
                id="comanda-editor-titulo"
                className="truncate text-lg font-bold text-primary"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-10 min-w-10 shrink-0 rounded-xl border border-border text-lg font-bold"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {children}
        </div>

        <div className="shrink-0 border-t border-border p-3">
          <Button fullWidth size="lg" onClick={onAceptar}>
            {aceptarLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
