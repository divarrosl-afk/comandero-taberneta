"use client";

import { useMemo, useState } from "react";
import { FichaPlatoRapida } from "@/components/carta/FichaPlatoRapida";
import { useMenuDia } from "@/hooks/useMenuDia";
import { dividirDestacados } from "@/lib/catalogo/search";
import { hayHistorialVentas } from "@/lib/catalogo/popularidad";
import { productoEnMenuHoy } from "@/lib/carta/format-producto";
import {
  labelSeccion,
  nombreBoton,
  precioCartaDe,
  type ProductoCatalogo,
  type SeccionCatalogo,
} from "@/types/catalogo";
import type { OrigenPlatos } from "@/lib/carta/carta-admin";
import type { SeccionPlatos } from "@/types/comanda";

interface CartaMenuSelectorProps {
  seccion: SeccionCatalogo;
  seccionPlatos?: SeccionPlatos;
  productos: ProductoCatalogo[];
  ventasPorId?: Map<string, number>;
  modoBusqueda?: boolean;
  origen?: OrigenPlatos;
  onSelect: (producto: ProductoCatalogo) => void;
}

function PlatoBoton({
  producto,
  subtitulo,
  badge,
  onSelect,
  onInfo,
}: {
  producto: ProductoCatalogo;
  subtitulo: string;
  badge?: string;
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
          "flex min-h-[4.25rem] w-full flex-col items-center justify-center rounded-2xl border-2 px-2 py-2.5 pr-11 text-center text-sm font-bold transition",
          agotado
            ? "cursor-not-allowed border-border bg-stone-100 text-stone-400 opacity-60"
            : "border-border bg-card active:scale-[0.98] hover:border-accent/50 hover:bg-accent/5",
          !agotado && producto.favorito ? "border-accent/40 bg-accent/5" : "",
          producto.recomendado && !agotado ? "ring-2 ring-amber-300/80" : "",
        ].join(" ")}
      >
        {badge && (
          <span className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
            {badge}
          </span>
        )}
        <span>
          {producto.favorito && !agotado && (
            <span className="mr-1 text-accent" aria-hidden="true">
              ★
            </span>
          )}
          {nombreBoton(producto)}
        </span>
        {subtitulo && (
          <span className="mt-0.5 text-xs font-medium text-muted">{subtitulo}</span>
        )}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onInfo();
        }}
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border-2 border-primary/30 bg-primary/10 text-sm font-bold text-primary"
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
  modoBusqueda?: boolean,
): string {
  if (producto.agotado) return "Agotado";
  const seccionLabel = modoBusqueda ? labelSeccion(producto.seccion) : "";
  const precioPart = (() => {
    if (enMenu) {
      return producto.suplemento
        ? `Menú +${producto.suplemento}€`
        : `Menú ${precioMenu ?? ""}€`.trim();
    }
    if (producto.suplemento) return `+${producto.suplemento}€`;
    const carta = precioCartaDe(producto);
    return carta ? `${carta}€` : "";
  })();

  if (modoBusqueda && seccionLabel) {
    return precioPart ? `${seccionLabel} · ${precioPart}` : seccionLabel;
  }
  return precioPart;
}

function GridProductos({
  lista,
  menu,
  seccionPlatos,
  seccion,
  modoBusqueda,
  ventasPorId,
  onSelect,
  onInfo,
}: {
  lista: ProductoCatalogo[];
  menu: ReturnType<typeof useMenuDia>["menu"];
  seccionPlatos?: SeccionPlatos;
  seccion: SeccionCatalogo;
  modoBusqueda?: boolean;
  ventasPorId: Map<string, number>;
  onSelect: (producto: ProductoCatalogo) => void;
  onInfo: (producto: ProductoCatalogo) => void;
}) {
  if (lista.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {lista.map((producto) => {
        const enMenu = productoEnMenuHoy(
          producto,
          menu,
          seccionPlatos as "primeros" | "segundos",
        );
        const ventas = ventasPorId.get(producto.id) ?? 0;
        return (
          <PlatoBoton
            key={producto.id}
            producto={producto}
            badge={
              modoBusqueda
                ? labelSeccion(producto.seccion)
                : ventas > 0
                  ? `🔥 ${ventas}`
                  : undefined
            }
            subtitulo={subtituloProducto(
              producto,
              enMenu,
              menu?.precioMenu,
              modoBusqueda,
            )}
            onSelect={() => !producto.agotado && onSelect(producto)}
            onInfo={() => onInfo(producto)}
          />
        );
      })}
    </div>
  );
}

function BloqueDestacados({
  titulo,
  lista,
  menu,
  seccionPlatos,
  seccion,
  ventasPorId,
  onSelect,
  onInfo,
}: {
  titulo: string;
  lista: ProductoCatalogo[];
  menu: ReturnType<typeof useMenuDia>["menu"];
  seccionPlatos?: SeccionPlatos;
  seccion: SeccionCatalogo;
  ventasPorId: Map<string, number>;
  onSelect: (producto: ProductoCatalogo) => void;
  onInfo: (producto: ProductoCatalogo) => void;
}) {
  if (lista.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wide text-accent">
        {titulo}
      </p>
      <GridProductos
        lista={lista}
        menu={menu}
        seccionPlatos={seccionPlatos}
        seccion={seccion}
        ventasPorId={ventasPorId}
        onSelect={onSelect}
        onInfo={onInfo}
      />
    </div>
  );
}

export function CartaMenuSelector({
  seccion,
  seccionPlatos,
  productos,
  ventasPorId = new Map(),
  modoBusqueda = false,
  origen,
  onSelect,
}: CartaMenuSelectorProps) {
  const { menu } = useMenuDia();
  const [ficha, setFicha] = useState<ProductoCatalogo | null>(null);

  const activos = useMemo(
    () => productos.filter((p) => p.activo),
    [productos],
  );

  const conMenu = seccionPlatos === "primeros" || seccionPlatos === "segundos";
  const menuActivo = Boolean(
    menu?.activo && conMenu && !modoBusqueda && !origen,
  );
  const conHistorial = hayHistorialVentas();

  const { menuLista, cartaLista, restoLista } = useMemo(() => {
    if (!menuActivo || !menu) {
      return {
        menuLista: [] as ProductoCatalogo[],
        cartaLista: [] as ProductoCatalogo[],
        restoLista: activos,
      };
    }

    const menuLista: ProductoCatalogo[] = [];
    const cartaLista: ProductoCatalogo[] = [];
    const restoLista: ProductoCatalogo[] = [];

    for (const p of activos) {
      const enMenu = productoEnMenuHoy(
        p,
        menu,
        seccionPlatos as "primeros" | "segundos",
      );
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

  const renderListaConDestacados = (
    tituloBloque: string,
    lista: ProductoCatalogo[],
  ) => {
    if (lista.length === 0) return null;

    const { favoritos, masVendidos, recomendados, resto } = dividirDestacados(
      lista,
      ventasPorId,
    );

    return (
      <div className="space-y-4">
        {tituloBloque && (
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {tituloBloque}
          </p>
        )}
        <BloqueDestacados
          titulo="★ Favoritos"
          lista={favoritos}
          menu={menu}
          seccionPlatos={seccionPlatos}
          seccion={seccion}
          ventasPorId={ventasPorId}
          onSelect={onSelect}
          onInfo={setFicha}
        />
        {conHistorial && (
          <BloqueDestacados
            titulo="🔥 Más vendidos"
            lista={masVendidos}
            menu={menu}
            seccionPlatos={seccionPlatos}
            seccion={seccion}
            ventasPorId={ventasPorId}
            onSelect={onSelect}
            onInfo={setFicha}
          />
        )}
        <BloqueDestacados
          titulo="Recomendados"
          lista={recomendados}
          menu={menu}
          seccionPlatos={seccionPlatos}
          seccion={seccion}
          ventasPorId={ventasPorId}
          onSelect={onSelect}
          onInfo={setFicha}
        />
        {resto.length > 0 && (
          <div className="space-y-2">
            {(favoritos.length > 0 ||
              masVendidos.length > 0 ||
              recomendados.length > 0) && (
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Todos
              </p>
            )}
            <GridProductos
              lista={resto}
              menu={menu}
              seccionPlatos={seccionPlatos}
              seccion={seccion}
              ventasPorId={ventasPorId}
              onSelect={onSelect}
              onInfo={setFicha}
            />
          </div>
        )}
      </div>
    );
  };

  const tituloOrigen =
    origen === "menu"
      ? "Menú del día"
      : origen === "carta-almuerzo"
        ? "Carta almuerzo"
        : origen === "carta-cenas"
          ? "Carta cenas"
          : "Platos";

  return (
    <>
      <div className="space-y-4">
        {modoBusqueda ? (
          <GridProductos
            lista={activos}
            menu={menu}
            seccionPlatos={seccionPlatos}
            seccion={seccion}
            modoBusqueda
            ventasPorId={ventasPorId}
            onSelect={onSelect}
            onInfo={setFicha}
          />
        ) : menuActivo ? (
          <>
            {renderListaConDestacados("Menú del día", menuLista)}
            {renderListaConDestacados("Carta", cartaLista)}
            {renderListaConDestacados("Otros", restoLista)}
          </>
        ) : (
          renderListaConDestacados(tituloOrigen, activos)
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
  ventasPorId,
  modoBusqueda,
  onSelect,
}: Omit<CartaMenuSelectorProps, "seccionPlatos">) {
  return (
    <CartaMenuSelector
      seccion={seccion}
      productos={productos}
      ventasPorId={ventasPorId}
      modoBusqueda={modoBusqueda}
      onSelect={onSelect}
    />
  );
}
