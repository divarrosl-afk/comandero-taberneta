"use client";

import type { ReactNode } from "react";

interface PanelDetalleSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function PanelDetalleSheet({
  open,
  onClose,
  children,
}: PanelDetalleSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50 p-2 sm:p-4">
      <button
        type="button"
        aria-label="Cerrar ticket"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative mx-auto mt-auto flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl sm:my-auto">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-muted">Ticket completo</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border-2 border-border px-4 py-2 text-sm font-bold active:scale-95"
          >
            Cerrar
          </button>
        </div>
        <div className="overflow-y-auto p-3 sm:p-4">{children}</div>
      </div>
    </div>
  );
}
