"use client";

import { Button } from "@/components/ui/Button";
import { AlergenosSelector } from "@/components/carta/AlergenosSelector";
import {
  SECCIONES_CATALOGO,
  TIPOS_PRODUCTO,
  type ProductoCatalogo,
} from "@/types/catalogo";

interface ProductoCartaEditorProps {
  producto: ProductoCatalogo;
  onChange: (c: Partial<ProductoCatalogo>) => void;
  onGuardar: () => void;
  onCancelar: () => void;
}

export function ProductoCartaEditor({
  producto,
  onChange,
  onGuardar,
  onCancelar,
}: ProductoCartaEditorProps) {
  const ingredientesTexto = producto.ingredientes.join(", ");

  return (
    <div className="space-y-4 rounded-xl border-2 border-primary/30 bg-background p-4">
      <div className="grid gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Nombre completo
          </label>
          <input
            type="text"
            value={producto.nombre}
            onChange={(e) => onChange({ nombre: e.target.value })}
            className="min-h-12 w-full rounded-xl border-2 border-border bg-card px-3 text-base font-medium outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Nombre corto (botón)
          </label>
          <input
            type="text"
            value={producto.nombreCorto ?? ""}
            onChange={(e) => onChange({ nombreCorto: e.target.value })}
            placeholder={producto.nombre || "Opcional"}
            className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Sección
          </label>
          <select
            value={producto.seccion}
            onChange={(e) =>
              onChange({
                seccion: e.target.value as ProductoCatalogo["seccion"],
              })
            }
            className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
          >
            {SECCIONES_CATALOGO.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Tipo
          </label>
          <select
            value={producto.tipo}
            onChange={(e) =>
              onChange({
                tipo: e.target.value as ProductoCatalogo["tipo"],
              })
            }
            className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
          >
            {TIPOS_PRODUCTO.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Precio carta €
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={producto.precioCarta ?? ""}
            onChange={(e) =>
              onChange({
                precioCarta: e.target.value ? Number(e.target.value) : undefined,
                precio: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Precio menú €
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={producto.precioMenu ?? ""}
            onChange={(e) =>
              onChange({
                precioMenu: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Suplemento €
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={producto.suplemento ?? ""}
            onChange={(e) =>
              onChange({
                suplemento: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">
          Descripción para camarero
        </label>
        <textarea
          value={producto.descripcionCamarero ?? ""}
          onChange={(e) => onChange({ descripcionCamarero: e.target.value })}
          rows={2}
          className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">
          Ingredientes principales (separados por coma)
        </label>
        <input
          type="text"
          value={ingredientesTexto}
          onChange={(e) =>
            onChange({
              ingredientes: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          placeholder="tomate, albahaca, mozzarella"
          className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
        />
      </div>

      <AlergenosSelector
        seleccionados={producto.alergenos}
        onChange={(alergenos) => onChange({ alergenos })}
      />

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">
          Notas internas
        </label>
        <textarea
          value={producto.notasInternas ?? ""}
          onChange={(e) => onChange({ notasInternas: e.target.value })}
          rows={2}
          className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 outline-none focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Orden
          </label>
          <input
            type="number"
            value={producto.orden}
            onChange={(e) => onChange({ orden: Number(e.target.value) || 0 })}
            className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Tiempo prep. (min)
          </label>
          <input
            type="number"
            min={0}
            value={producto.tiempoPreparacion ?? ""}
            onChange={(e) =>
              onChange({
                tiempoPreparacion: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "favorito", label: producto.favorito ? "★ Favorito" : "☆ Favorito" },
            { key: "recomendado", label: producto.recomendado ? "✓ Recomendado" : "Recomendado" },
            { key: "activo", label: producto.activo ? "Activo" : "Inactivo" },
            { key: "agotado", label: producto.agotado ? "Agotado" : "Disponible" },
          ] as const
        ).map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => onChange({ [chip.key]: !producto[chip.key] })}
            className={[
              "rounded-full border-2 px-4 py-2 text-sm font-semibold",
              producto[chip.key]
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card",
            ].join(" ")}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" fullWidth onClick={onCancelar}>
          Cancelar
        </Button>
        <Button
          size="sm"
          fullWidth
          onClick={onGuardar}
          disabled={!producto.nombre.trim()}
        >
          Guardar
        </Button>
      </div>
    </div>
  );
}
