"use client";

import { lineasFichaPlato } from "@/lib/carta/format-producto";
import { nombreBoton, type ProductoCatalogo } from "@/types/catalogo";
import type { MenuDiaConfig } from "@/types/menu-dia";
import type { SeccionPlatos } from "@/types/comanda";

interface FichaPlatoRapidaProps {
  producto: ProductoCatalogo;
  menu: MenuDiaConfig | null;
  seccion?: SeccionPlatos;
  onCerrar: () => void;
}

export function FichaPlatoRapida({
  producto,
  menu,
  seccion,
  onCerrar,
}: FichaPlatoRapidaProps) {
  const lineas = lineasFichaPlato(
    producto,
    menu,
    seccion === "primeros" || seccion === "segundos" ? seccion : undefined,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
      onClick={onCerrar}
      role="presentation"
    >
      <div
        className="max-h-[80dvh] w-full max-w-lg overflow-y-auto rounded-2xl border-2 border-border bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="ficha-plato-titulo"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="ficha-plato-titulo" className="text-xl font-bold text-primary">
              {producto.nombre}
            </h2>
            {producto.nombreCorto && producto.nombreCorto !== producto.nombre && (
              <p className="text-sm text-muted">Botón: {nombreBoton(producto)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="min-h-10 min-w-10 rounded-xl border border-border text-lg font-bold"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <dl className="space-y-3">
          {lineas.map((l) => (
            <div key={l.label}>
              <dt className="text-xs font-bold uppercase text-muted">{l.label}</dt>
              <dd className="mt-0.5 text-sm font-medium">{l.valor}</dd>
            </div>
          ))}
        </dl>

        {producto.agotado && (
          <p className="mt-4 rounded-xl bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-600">
            Plato agotado — no se puede añadir a la comanda
          </p>
        )}

        <button
          type="button"
          onClick={onCerrar}
          className="mt-5 min-h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
