"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  ZONAS_MESA,
  type MesaConfig,
  type ZonaMesa,
} from "@/types/mesas";

interface MesaEditorProps {
  mesa: MesaConfig;
  esNuevo?: boolean;
  onGuardar: (mesa: MesaConfig) => void;
  onCancelar: () => void;
}

export function MesaEditor({
  mesa,
  esNuevo = false,
  onGuardar,
  onCancelar,
}: MesaEditorProps) {
  const [form, setForm] = useState<MesaConfig>(mesa);

  return (
    <div className="space-y-3 rounded-xl border-2 border-primary/30 bg-background p-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Código
          </label>
          <input
            type="text"
            value={form.codigo}
            disabled={!esNuevo}
            onChange={(e) =>
              setForm({
                ...form,
                codigo: e.target.value.toUpperCase(),
                id: esNuevo ? e.target.value.toUpperCase() : form.id,
              })
            }
            className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary disabled:opacity-60"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Nombre visible
          </label>
          <input
            type="text"
            value={form.nombreVisible}
            onChange={(e) =>
              setForm({ ...form, nombreVisible: e.target.value })
            }
            className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Zona
          </label>
          <select
            value={form.zona}
            onChange={(e) =>
              setForm({ ...form, zona: e.target.value as ZonaMesa })
            }
            className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
          >
            {ZONAS_MESA.map((z) => (
              <option key={z.id} value={z.id}>
                {z.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Orden
          </label>
          <input
            type="number"
            value={form.orden}
            onChange={(e) =>
              setForm({ ...form, orden: Number(e.target.value) || 0 })
            }
            className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setForm({ ...form, activa: !form.activa })}
          className={[
            "rounded-full border-2 px-4 py-2 text-sm font-semibold",
            form.activa
              ? "border-green-300 bg-green-50 text-green-800"
              : "border-border bg-card",
          ].join(" ")}
        >
          {form.activa ? "Activa" : "Inactiva"}
        </button>
        {form.zona === "rambla" && !form.esVarianteB && (
          <button
            type="button"
            onClick={() =>
              setForm({ ...form, permiteVarianteB: !form.permiteVarianteB })
            }
            className={[
              "rounded-full border-2 px-4 py-2 text-sm font-semibold",
              form.permiteVarianteB
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card",
            ].join(" ")}
          >
            {form.permiteVarianteB ? "Permite mesa B" : "Sin mesa B"}
          </button>
        )}
        {form.esVarianteB && (
          <span className="rounded-full border border-border px-3 py-2 text-xs font-semibold">
            Variante B de {form.mesaPrincipalId}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" fullWidth onClick={onCancelar}>
          Cancelar
        </Button>
        <Button
          size="sm"
          fullWidth
          onClick={() => onGuardar(form)}
          disabled={!form.codigo.trim()}
        >
          Guardar
        </Button>
      </div>
    </div>
  );
}
