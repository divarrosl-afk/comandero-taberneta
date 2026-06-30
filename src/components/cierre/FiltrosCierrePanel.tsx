"use client";

import {
  ESTADOS_CIERRE,
  FILTRO_TODOS_CAMARERO,
  TIPOS_CIERRE,
  type FiltrosCierre,
} from "@/types/cierre";

interface FiltrosCierrePanelProps {
  filtros: FiltrosCierre;
  camareros: string[];
  mesas: string[];
  onChange: (cambios: Partial<FiltrosCierre>) => void;
}

export function FiltrosCierrePanel({
  filtros,
  camareros,
  mesas,
  onChange,
}: FiltrosCierrePanelProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
        Filtros
      </h2>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">
          Fecha
        </label>
        <input
          type="date"
          value={filtros.fecha}
          onChange={(e) =>
            onChange({
              fecha: e.target.value,
              camarero: FILTRO_TODOS_CAMARERO,
              mesa: null,
            })
          }
          className="min-h-11 w-full rounded-xl border-2 border-border bg-background px-3 outline-none focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Camarero
          </label>
          <select
            value={filtros.camarero}
            onChange={(e) => onChange({ camarero: e.target.value })}
            className="min-h-11 w-full rounded-xl border-2 border-border bg-background px-3 outline-none focus:border-primary"
          >
            <option value={FILTRO_TODOS_CAMARERO}>Todos</option>
            {camareros.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Mesa
          </label>
          <select
            value={filtros.mesa ?? ""}
            onChange={(e) =>
              onChange({
                mesa: e.target.value || null,
              })
            }
            className="min-h-11 w-full rounded-xl border-2 border-border bg-background px-3 outline-none focus:border-primary"
          >
            <option value="">Todas</option>
            {mesas.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">
          Tipo
        </label>
        <div className="flex gap-1">
          {TIPOS_CIERRE.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ tipo: t.id })}
              className={[
                "flex-1 rounded-xl py-2 text-sm font-bold transition active:scale-95",
                filtros.tipo === t.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">
          Estado
        </label>
        <div className="flex flex-wrap gap-1">
          {ESTADOS_CIERRE.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => onChange({ estado: e.id })}
              className={[
                "rounded-xl px-3 py-2 text-xs font-bold transition active:scale-95",
                filtros.estado === e.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background",
              ].join(" ")}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
