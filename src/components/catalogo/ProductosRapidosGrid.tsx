"use client";

import { useMemo } from "react";
import { useCatalogo } from "@/hooks/useCatalogo";
import type { ProductoCatalogo, SeccionCatalogo } from "@/types/catalogo";

interface ProductosRapidosGridProps {
  seccion: SeccionCatalogo;
  onSelect: (producto: ProductoCatalogo) => void;
  titulo?: string;
}

export function ProductosRapidosGrid({
  seccion,
  onSelect,
  titulo = "Platos frecuentes",
}: ProductosRapidosGridProps) {
  const { productos } = useCatalogo();

  const lista = useMemo(
    () =>
      productos
        .filter((p) => p.seccion === seccion && p.activo)
        .sort((a, b) => {
          if (a.favorito !== b.favorito) return a.favorito ? -1 : 1;
          return a.nombre.localeCompare(b.nombre, "es");
        }),
    [productos, seccion],
  );

  if (lista.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-background px-3 py-4 text-center text-sm text-muted">
        Sin productos activos. Configura el catálogo en Ajustes.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {titulo}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {lista.map((producto) => (
          <button
            key={producto.id}
            type="button"
            onClick={() => onSelect(producto)}
            className={[
              "flex min-h-14 flex-col items-center justify-center rounded-xl border-2 bg-card px-2 py-2 text-center text-sm font-semibold transition active:scale-95 hover:border-accent/50 hover:bg-accent/5",
              producto.favorito ? "border-accent/30" : "border-border",
            ].join(" ")}
          >
            <span>
              {producto.favorito && (
                <span className="mr-1 text-accent" aria-hidden="true">
                  ★
                </span>
              )}
              {producto.nombre}
            </span>
            {(producto.precio || producto.suplemento) && (
              <span className="mt-0.5 text-xs font-normal text-muted">
                {producto.suplemento
                  ? `+${producto.suplemento}€`
                  : `${producto.precio}€`}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
