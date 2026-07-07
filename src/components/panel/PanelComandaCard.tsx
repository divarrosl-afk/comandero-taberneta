"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { etiquetaTipoPlato } from "@/lib/comanda/tipo-plato";
import { resolveNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import { formatHora } from "@/lib/historial/items";
import { EstadoPanelBadge } from "@/components/panel/EstadoPanelBadge";
import { SemaforoPanelSelector } from "@/components/panel/SemaforoPanelSelector";
import { PostresMarcaBanner } from "@/components/panel/PostresMarcaBanner";
import { reimprimirComandaCocina } from "@/modules/impresion-wifi/imprimir-comanda";
import type { ComandaCocina, PlatoComanda } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";
import type { ComandaPostres } from "@/types/postres";
import type { MesaConfig } from "@/types/mesas";

function lineaPlato(plato: PlatoComanda): string {
  const cantidad = plato.cantidad > 1 ? ` x${plato.cantidad}` : "";
  const tipo = etiquetaTipoPlato(plato.tipo, plato.saleComo, plato.suplemento);
  const extras = [
    ...tipo,
    ...plato.modificaciones,
    ...plato.salsas.map((s) => `${s.nombre} x${s.cantidad}`),
    ...(plato.notaLibre ? [plato.notaLibre] : []),
  ];
  return extras.length
    ? `${plato.nombre}${cantidad} · ${extras.join(" · ")}`
    : `${plato.nombre}${cantidad}`;
}

function BloqueSeccion({
  titulo,
  lineas,
}: {
  titulo: string;
  lineas: string[];
}) {
  if (!lineas.length) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-accent">
        {titulo}
      </p>
      <ul className="space-y-1">
        {lineas.map((linea, i) => (
          <li key={i} className="text-sm leading-snug">
            · {linea}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface PanelComandaCardProps {
  comanda: ComandaCocina;
  mesas?: MesaConfig[];
  postresMesa?: ComandaPostres;
  onCambiarEstado: (estado: EstadoPanel) => void;
  onEliminar: () => void | Promise<void>;
}

export function PanelComandaCard({
  comanda,
  mesas = [],
  postresMesa,
  onCambiarEstado,
  onEliminar,
}: PanelComandaCardProps) {
  const nombreMesa = resolveNombreMesaComanda(comanda, mesas);
  const [reimpresionMsg, setReimpresionMsg] = useState<string | null>(null);
  const [reimpresionError, setReimpresionError] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [eliminarError, setEliminarError] = useState<string | null>(null);

  const handleReimprimir = async () => {
    setReimpresionMsg("Enviando a impresora…");
    setReimpresionError(false);
    const res = await reimprimirComandaCocina(comanda);
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

      {postresMesa && <PostresMarcaBanner comanda={postresMesa} />}

      <div className="mb-4 space-y-3 rounded-xl bg-background p-3">
        <BloqueSeccion
          titulo="Entrantes"
          lineas={comanda.entrantes.map(lineaPlato)}
        />
        <BloqueSeccion
          titulo="Primeros"
          lineas={comanda.primeros.map(lineaPlato)}
        />
        <BloqueSeccion
          titulo="Segundos"
          lineas={comanda.segundos.map(lineaPlato)}
        />
        <BloqueSeccion
          titulo="Bebidas"
          lineas={comanda.bebidas.map(lineaPlato)}
        />
        <BloqueSeccion
          titulo="Extras"
          lineas={comanda.extras.map((e) =>
            e.cantidad > 1 ? `${e.nombre} x${e.cantidad}` : e.nombre,
          )}
        />
        <BloqueSeccion titulo="Observaciones" lineas={comanda.observaciones} />
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
        title="¿Eliminar comanda?"
        message={`Se quitará la comanda de ${nombreMesa} (${formatHora(comanda.creadaEn)}) del panel.`}
        confirmLabel="Eliminar"
        onConfirm={() => {
          void (async () => {
            try {
              await onEliminar();
              setConfirmEliminar(false);
            } catch (e) {
              setEliminarError(
                e instanceof Error ? e.message : "No se pudo eliminar",
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
