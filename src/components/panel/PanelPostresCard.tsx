"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getEstadoXCafeLabel } from "@/data/postres-catalogo";
import { formatHora } from "@/lib/historial/items";
import { resolveNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import { EstadoPanelBadge } from "@/components/panel/EstadoPanelBadge";
import { SemaforoPanelSelector } from "@/components/panel/SemaforoPanelSelector";
import { reimprimirComandaPostres } from "@/modules/impresion-wifi/imprimir-comanda";
import type { EstadoPanel } from "@/types/panel";
import type { ComandaPostres } from "@/types/postres";
import type { MesaConfig } from "@/types/mesas";

interface PanelPostresCardProps {
  comanda: ComandaPostres;
  mesas?: MesaConfig[];
  onCambiarEstado: (estado: EstadoPanel) => void;
  onEliminar: () => void | Promise<void>;
}

export function PanelPostresCard({
  comanda,
  mesas = [],
  onCambiarEstado,
  onEliminar,
}: PanelPostresCardProps) {
  const nombreMesa = resolveNombreMesaComanda(comanda, mesas);
  const [reimpresionMsg, setReimpresionMsg] = useState<string | null>(null);
  const [reimpresionError, setReimpresionError] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [eliminarError, setEliminarError] = useState<string | null>(null);

  const handleReimprimir = async () => {
    setReimpresionMsg("Enviando a impresora…");
    setReimpresionError(false);
    const res = await reimprimirComandaPostres(comanda);
    setReimpresionMsg(res.summary);
    setReimpresionError(!res.allOk);
  };

  return (
    <article className="rounded-2xl border-2 border-border bg-card p-4 shadow-sm">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-2xl font-bold text-primary">{nombreMesa}</p>
          <p className="text-sm font-medium text-muted">
            {comanda.camarero} · {formatHora(comanda.creadaEn)}
          </p>
        </div>
        <EstadoPanelBadge estado={comanda.estadoPanel} />
      </header>

      <div className="mb-4 space-y-3 rounded-xl bg-background p-3">
        {comanda.postres.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-accent">
              Postres
            </p>
            <ul className="space-y-1">
              {comanda.postres.map((p) => (
                <li key={p.id} className="text-sm">
                  · {p.nombre}
                  {p.cantidad > 1 && ` x${p.cantidad}`}
                  {p.nota && ` · ${p.nota}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(comanda.cafes?.length > 0 || comanda.estadoXCafe || comanda.clH) && (
          <div className="space-y-2 border-t border-border pt-2">
            <p className="text-xs font-bold uppercase tracking-wide text-accent">
              Cafés
            </p>
            {comanda.estadoXCafe && (
              <p className="text-sm font-semibold">
                X: {getEstadoXCafeLabel(comanda.estadoXCafe)}
              </p>
            )}
            <ul className="space-y-1">
              {(comanda.cafes ?? []).map((c) => (
                <li key={c.id} className="text-sm">
                  · {c.nombre}
                  {c.cantidad > 1 && ` x${c.cantidad}`}
                  {c.nota && ` · ${c.nota}`}
                </li>
              ))}
            </ul>
            {comanda.clH && <p className="text-sm font-semibold">C/L + H</p>}
          </div>
        )}

        {comanda.observaciones.length > 0 && (
          <div className="mt-2 border-t border-border pt-2">
            <p className="text-xs font-bold uppercase text-accent">Observaciones</p>
            {comanda.observaciones.map((o, i) => (
              <p key={i} className="text-sm">
                · {o}
              </p>
            ))}
          </div>
        )}
      </div>

      <SemaforoPanelSelector
        value={comanda.estadoPanel}
        onChange={onCambiarEstado}
      />

      <div className="mt-4 space-y-2">
        <Button variant="outline" fullWidth onClick={handleReimprimir}>
          Reimprimir ticket
        </Button>
        <Button
          variant="ghost"
          fullWidth
          onClick={() => {
            setEliminarError(null);
            setConfirmEliminar(true);
          }}
        >
          Eliminar
        </Button>
        {eliminarError && (
          <p className="text-center text-xs font-medium text-red-600">
            {eliminarError}
          </p>
        )}
        {reimpresionMsg && (
          <p
            className={[
              "text-center text-xs font-medium",
              reimpresionError ? "text-red-600" : "text-muted",
            ].join(" ")}
          >
            {reimpresionMsg}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={confirmEliminar}
        title="¿Marcar mesa libre?"
        message={`La comanda de postres de ${nombreMesa} (${formatHora(comanda.creadaEn)}) saldrá del panel activo, igual que con «Mesa libre» en el semáforo.`}
        confirmLabel="Mesa libre"
        onConfirm={() => {
          void (async () => {
            try {
              await onEliminar();
              setConfirmEliminar(false);
            } catch (e) {
              setEliminarError(
                e instanceof Error ? e.message : "No se pudo marcar mesa libre",
              );
              setConfirmEliminar(false);
            }
          })();
        }}
        onCancel={() => setConfirmEliminar(false)}
      />
    </article>
  );
}
