"use client";

import { useMemo, useState } from "react";
import { FichaPlatoRapida } from "@/components/carta/FichaPlatoRapida";
import { useMenuDia } from "@/hooks/useMenuDia";
import { productoEnMenuHoy } from "@/lib/carta/format-producto";
import {
  nombreBoton,
  precioCartaDe,
  type ProductoCatalogo,
  type SeccionCatalogo,
} from "@/types/catalogo";
import type { SeccionPlatos } from "@/types/comanda";

interface CartaMenuSelectorProps {
  seccion: SeccionCatalogo;
  seccionPlatos?: SeccionPlatos;
  productos: ProductoCatalogo[];
  onSelect: (producto: ProductoCatalogo) => void;
}

function PlatoBoton({
  producto,
  subtitulo,
  onSelect,
  onInfo,
}: {
  producto: ProductoCatalogo;
  subtitulo: string;
  onSelect: () => void;
  onInfo: () => void;
}) {
  const agotado = producto.agotado;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={agotado}
        onClick={onSelect}
        className={[
          "flex min-h-14 w-full flex-col items-center justify-center rounded-xl border-2 px-2 py-2 pr-8 text-center text-sm font-semibold transition",
          agotado
            ? "cursor-not-allowed border-border bg-stone-100 text-stone-400 opacity-60"
            : "border-border bg-card active:scale-95 hover:border-accent/50 hover:bg-accent/5",
          !agotado && producto.favorito ? "border-accent/30" : "",
          producto.recomendado && !agotado ? "ring-1 ring-amber-300" : "",
        ].join(" ")}
      >
        <span>
          {producto.favorito && !agotado && (
            <span className="mr-1 text-accent" aria-hidden="true">
              ★
            </span>
          )}
          {nombreBoton(producto)}
        </span>
        {subtitulo && (
          <span className="mt-0.5 text-xs font-normal text-muted">{subtitulo}</span>
        )}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onInfo();
        }}
        className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border border-border bg-background text-xs font-bold text-muted"
        aria-label={`Info de ${producto.nombre}`}
      >
        i
      </button>
    </div>
  );
}

function subtituloProducto(
  producto: ProductoCatalogo,
  enMenu: boolean,
  precioMenu?: number,
): string {
  if (producto.agotado) return "Agotado";
  if (enMenu) {
    return producto.suplemento
      ? `Menú +${producto.suplemento}€`
      : `Menú ${precioMenu ?? ""}€`.trim();
  }
  if (producto.suplemento) return `+${producto.suplemento}€`;
  const carta = precioCartaDe(producto);
  return carta ? `${carta}€` : "";
}

export function CartaMenuSelector({
  seccion,
  seccionPlatos,
  productos,
  onSelect,
}: CartaMenuSelectorProps) {
  const { menu } = useMenuDia();
  const [ficha, setFicha] = useState<ProductoCatalogo | null>(null);

  const activos = useMemo(
    () => productos.filter((p) => p.activo).sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es")),
    [productos],
  );

  const conMenu = seccionPlatos === "primeros" || seccionPlatos === "segundos";
  const menuActivo = Boolean(menu?.activo && conMenu);

  const { menuLista, cartaLista, restoLista } = useMemo(() => {
    if (!menuActivo || !menu) {
      return { menuLista: [] as ProductoCatalogo[], cartaLista: [] as ProductoCatalogo[], restoLista: activos };
    }

    const menuLista: ProductoCatalogo[] = [];
    const cartaLista: ProductoCatalogo[] = [];
    const restoLista: ProductoCatalogo[] = [];

    for (const p of activos) {
      const enMenu = productoEnMenuHoy(p, menu, seccionPlatos as "primeros" | "segundos");
      const soloCarta = p.tipo === "carta";
      const soloMenu = p.tipo === "menu-dia";

      if (enMenu && !soloCarta) {
        menuLista.push(p);
      } else if (!soloMenu || !enMenu) {
        if (p.tipo === "carta" || p.tipo === "ambos") {
          cartaLista.push(p);
        } else {
          restoLista.push(p);
        }
      }
    }

    return { menuLista, cartaLista, restoLista };
  }, [activos, menu, menuActivo, seccionPlatos]);

  if (activos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-background px-3 py-4 text-center text-sm text-muted">
        Sin productos activos. Configura la carta en Ajustes.
      </p>
    );
  }

  const renderBloque = (titulo: string, lista: ProductoCatalogo[]) => {
    if (lista.length === 0) return null;
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {titulo}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {lista.map((producto) => {
            const enMenu = productoEnMenuHoy(
              producto,
              menu,
              seccionPlatos as "primeros" | "segundos",
            );
            return (
              <PlatoBoton
                key={producto.id}
                producto={producto}
                subtitulo={subtituloProducto(producto, enMenu, menu?.precioMenu)}
                onSelect={() => !producto.agotado && onSelect(producto)}
                onInfo={() => setFicha(producto)}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {menuActivo ? (
          <>
            {renderBloque("Menú del día", menuLista)}
            {renderBloque("Carta", cartaLista)}
            {renderBloque("Otros", restoLista)}
          </>
        ) : (
          renderBloque("Platos", activos)
        )}
      </div>

      {ficha && (
        <FichaPlatoRapida
          producto={ficha}
          menu={menu}
          seccion={seccionPlatos}
          onCerrar={() => setFicha(null)}
        />
      )}
    </>
  );
}

/** Selector simple para secciones sin menú/carta (entrantes, bebidas, postres) */
export function CartaSelectorSimple({
  seccion,
  productos,
  onSelect,
}: Omit<CartaMenuSelectorProps, "seccionPlatos">) {
  return (
    <CartaMenuSelector
      seccion={seccion}
      productos={productos}
      onSelect={onSelect}
    />
  );
}
