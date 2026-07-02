"use client";

import { etiquetaTipoPlato } from "@/lib/comanda/tipo-plato";
import { getNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import { formatHora } from "@/lib/historial/items";
import { EstadoPanelBadge } from "@/components/panel/EstadoPanelBadge";
import { SemaforoPanelSelector } from "@/components/panel/SemaforoPanelSelector";
import { PostresMarcaBanner } from "@/components/panel/PostresMarcaBanner";
import type { ComandaCocina, PlatoComanda } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";
import type { ComandaPostres } from "@/types/postres";

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
  postresMesa?: ComandaPostres;
  onCambiarEstado: (estado: EstadoPanel) => void;
}

export function PanelComandaCard({
  comanda,
  postresMesa,
  onCambiarEstado,
}: PanelComandaCardProps) {
  return (
    <article className="rounded-2xl border-2 border-border bg-card p-4 shadow-sm">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-2xl font-bold text-primary">
            MESA {getNombreMesaComanda(comanda)}
          </p>
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
    </article>
  );
}
