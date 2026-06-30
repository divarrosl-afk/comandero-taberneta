"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EstadoPanelBadge } from "@/components/panel/EstadoPanelBadge";
import {
  entradaToTicket,
  formatFechaHora,
  tipoLabel,
  type HistorialEntrada,
} from "@/lib/historial/items";

interface HistorialCardProps {
  entrada: HistorialEntrada;
  onReimprimir: () => void;
  onEliminar: () => void;
  puedeEliminar?: boolean;
}

export function HistorialCard({
  entrada,
  onReimprimir,
  onEliminar,
  puedeEliminar = false,
}: HistorialCardProps) {
  const [expandido, setExpandido] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { comanda } = entrada;
  const ticket = entradaToTicket(entrada);

  return (
    <>
      <article className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          className="flex w-full items-center gap-3 p-4 text-left"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
            {comanda.mesa}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-bold uppercase",
                  entrada.tipo === "cocina"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-purple-100 text-purple-800",
                ].join(" ")}
              >
                {tipoLabel(entrada.tipo)}
              </span>
              <EstadoPanelBadge estado={comanda.estadoPanel} />
            </div>
            <p className="mt-1 font-semibold">{comanda.camarero}</p>
            <p className="text-sm text-muted">{formatFechaHora(comanda.creadaEn)}</p>
          </div>
          <span className="text-muted">{expandido ? "▲" : "▼"}</span>
        </button>

        {expandido && (
          <div className="border-t border-border p-4">
            <pre className="mb-4 whitespace-pre-wrap rounded-xl bg-stone-900 p-3 font-mono text-xs leading-relaxed text-stone-100">
              {ticket}
            </pre>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" fullWidth onClick={onReimprimir}>
                Reimprimir
              </Button>
              {puedeEliminar && (
                <Button
                  variant="danger"
                  size="sm"
                  fullWidth
                  onClick={() => setConfirmDelete(true)}
                >
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        )}
      </article>

      <ConfirmDialog
        open={confirmDelete}
        title="¿Eliminar del historial?"
        message={`Se eliminará la comanda de MESA ${comanda.mesa} (${tipoLabel(entrada.tipo)}).`}
        confirmLabel="Eliminar"
        onConfirm={() => {
          onEliminar();
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
