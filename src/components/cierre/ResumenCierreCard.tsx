"use client";

import { ESTADOS_PANEL } from "@/types/panel";
import { getNombreMesa } from "@/lib/storage/mesas";
import type { ResumenCierre } from "@/types/cierre";

interface ResumenCierreCardProps {
  resumen: ResumenCierre;
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-center">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted">{label}</p>
    </div>
  );
}

function ListaTop({
  titulo,
  items,
}: {
  titulo: string;
  items: { nombre: string; cantidad: number }[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4">
        <p className="text-sm font-semibold">{titulo}</p>
        <p className="mt-1 text-sm text-muted">Sin datos</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-2 text-sm font-bold">{titulo}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.nombre}
            className="flex items-center justify-between text-sm"
          >
            <span className="truncate pr-2">{item.nombre}</span>
            <span className="shrink-0 font-bold text-primary">
              {item.cantidad}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResumenCierreCard({ resumen }: ResumenCierreCardProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold">Resumen del día</h2>

      <div className="grid grid-cols-3 gap-2">
        <StatBox label="Cocina" value={resumen.totalCocina} />
        <StatBox label="Postres" value={resumen.totalPostres} />
        <StatBox label="Tickets" value={resumen.totalTickets} />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-2 text-sm font-bold">Estados</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {ESTADOS_PANEL.map((estado) => (
            <div
              key={estado.id}
              className="rounded-lg bg-background px-2 py-2 text-center"
            >
              <p className="text-lg font-bold">{resumen.porEstado[estado.id]}</p>
              <p className="text-xs text-muted">{estado.labelCorto}</p>
            </div>
          ))}
        </div>
      </div>

      {resumen.porCamarero.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-sm font-bold">Por camarero</p>
          <ul className="space-y-1">
            {resumen.porCamarero.map((c) => (
              <li
                key={c.camarero}
                className="flex justify-between text-sm"
              >
                <span>{c.camarero}</span>
                <span className="font-bold">{c.cantidad}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {resumen.porMesa.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-sm font-bold">Por mesa</p>
          <div className="flex flex-wrap gap-2">
            {resumen.porMesa.map((m) => (
              <span
                key={m.mesa}
                className="rounded-full border border-border bg-background px-3 py-1 text-sm"
              >
                {getNombreMesa(m.mesa)}: <strong>{m.cantidad}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      <ListaTop titulo="Platos más pedidos" items={resumen.platosMasPedidos} />
      <ListaTop titulo="Bebidas más pedidas" items={resumen.bebidasMasPedidas} />
      <ListaTop titulo="Postres más pedidos" items={resumen.postresMasPedidos} />
    </section>
  );
}
