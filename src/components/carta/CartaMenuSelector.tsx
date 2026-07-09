"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FichaPlatoRapida } from "@/components/carta/FichaPlatoRapida";
import { useMenuDia } from "@/hooks/useMenuDia";
import { dividirDestacados } from "@/lib/catalogo/search";
import { hayHistorialVentas } from "@/lib/catalogo/popularidad";
import { productoEnMenuHoy } from "@/lib/carta/format-producto";
import {
  agruparBocadillos,
  listaSonBocadillos,
} from "@/lib/carta/bocadillos-grid";
import {
  agruparTorradas,
  listaUsaGridTorradas,
} from "@/lib/carta/torradas-grid";
import {
  agruparProductosPorCategoria,
  origenACartaServicio,
  type OrigenPlatos,
} from "@/lib/carta/carta-admin";
import {
  labelCategoriaCarta,
  labelSeccion,
  nombreBoton,
  precioCartaDe,
  type CartaServicio,
  type ProductoCatalogo,
  type SeccionCatalogo,
} from "@/types/catalogo";
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
  etiqueta,
  onSelect,
  onInfo,
}: {
  producto: ProductoCatalogo;
  subtitulo: string;
  badge?: string;
  etiqueta?: string;
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
          {etiqueta ?? nombreBoton(producto)}
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

function GridBocadillos({
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
  const filas = useMemo(() => agruparBocadillos(lista), [lista]);
  if (filas.length === 0) return null;

  const renderCelda = (
    producto: ProductoCatalogo | undefined,
    etiqueta: "1/2" | "BOC",
  ) => {
    if (!producto) {
      return (
        <div
          className="min-h-[4.25rem] rounded-2xl border-2 border-dashed border-border/60 bg-stone-50"
          aria-hidden="true"
        />
      );
    }

    const enMenu = productoEnMenuHoy(
      producto,
      menu,
      seccionPlatos as "primeros" | "segundos",
    );
    const ventas = ventasPorId.get(producto.id) ?? 0;

    return (
      <PlatoBoton
        producto={producto}
        badge={
          modoBusqueda
            ? producto.categoriaCarta
              ? labelCategoriaCarta(
                  producto.cartaServicio ?? "almuerzo",
                  producto.categoriaCarta,
                )
              : labelSeccion(producto.seccion)
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
        etiqueta={etiqueta}
      />
    );
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 px-1">
        <p className="text-center text-xs font-bold uppercase tracking-wide text-accent">
          1/2
        </p>
        <p className="text-center text-xs font-bold uppercase tracking-wide text-accent">
          BOC
        </p>
      </div>
      {filas.map((fila) => (
        <div key={fila.relleno} className="space-y-1">
          <p className="px-1 text-xs font-semibold text-foreground">{fila.relleno}</p>
          <div className="grid grid-cols-2 gap-2">
            {renderCelda(fila.medio, "1/2")}
            {renderCelda(fila.entero, "BOC")}
          </div>
        </div>
      ))}
    </div>
  );
}

function GridTorradas({
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
  const filas = useMemo(() => agruparTorradas(lista), [lista]);
  if (filas.length === 0) return null;

  const renderCelda = (
    producto: ProductoCatalogo | undefined,
    etiqueta: "Desayuno" | "Carta",
  ) => {
    if (!producto) {
      return (
        <div
          className="min-h-[4.25rem] rounded-2xl border-2 border-dashed border-border/60 bg-stone-50"
          aria-hidden="true"
        />
      );
    }

    const enMenu = productoEnMenuHoy(
      producto,
      menu,
      seccionPlatos as "primeros" | "segundos",
    );
    const ventas = ventasPorId.get(producto.id) ?? 0;

    return (
      <PlatoBoton
        producto={producto}
        badge={
          modoBusqueda
            ? producto.categoriaCarta
              ? labelCategoriaCarta(
                  producto.cartaServicio ?? "almuerzo",
                  producto.categoriaCarta,
                )
              : labelSeccion(producto.seccion)
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
        etiqueta={etiqueta}
      />
    );
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 px-1">
        <p className="text-center text-xs font-bold uppercase tracking-wide text-accent">
          Desayuno
        </p>
        <p className="text-center text-xs font-bold uppercase tracking-wide text-accent">
          Carta
        </p>
      </div>
      {filas.map((fila) => (
        <div key={fila.relleno} className="space-y-1">
          <p className="px-1 text-xs font-semibold text-foreground">{fila.relleno}</p>
          <div className="grid grid-cols-2 gap-2">
            {renderCelda(fila.desayuno, "Desayuno")}
            {renderCelda(fila.carta, "Carta")}
          </div>
        </div>
      ))}
    </div>
  );
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

  if (listaSonBocadillos(lista)) {
    return (
      <GridBocadillos
        lista={lista}
        menu={menu}
        seccionPlatos={seccionPlatos}
        seccion={seccion}
        modoBusqueda={modoBusqueda}
        ventasPorId={ventasPorId}
        onSelect={onSelect}
        onInfo={onInfo}
      />
    );
  }

  if (listaUsaGridTorradas(lista)) {
    return (
      <GridTorradas
        lista={lista}
        menu={menu}
        seccionPlatos={seccionPlatos}
        seccion={seccion}
        modoBusqueda={modoBusqueda}
        ventasPorId={ventasPorId}
        onSelect={onSelect}
        onInfo={onInfo}
      />
    );
  }

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
                ? producto.categoriaCarta
                  ? labelCategoriaCarta(
                      producto.cartaServicio ?? "almuerzo",
                      producto.categoriaCarta,
                    )
                  : labelSeccion(producto.seccion)
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

function CategoriaAcordeon({
  id,
  label,
  count,
  abierta,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  count: number;
  abierta: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierta}
        aria-controls={`categoria-${id}`}
        className="flex min-h-12 w-full items-center justify-between gap-2 px-3 py-2.5 text-left font-bold transition active:bg-border/30"
      >
        <span className="text-sm">
          {label}
          <span className="ml-1.5 text-xs font-medium text-muted">({count})</span>
        </span>
        <span
          className={[
            "text-xs text-muted transition-transform",
            abierta ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>
      {abierta && (
        <div id={`categoria-${id}`} className="border-t border-border p-2">
          {children}
        </div>
      )}
    </div>
  );
}

function SelectorPorCategorias({
  productos,
  carta,
  menu,
  seccionPlatos,
  seccion,
  ventasPorId,
  onSelect,
  onInfo,
}: {
  productos: ProductoCatalogo[];
  carta: CartaServicio;
  menu: ReturnType<typeof useMenuDia>["menu"];
  seccionPlatos?: SeccionPlatos;
  seccion: SeccionCatalogo;
  ventasPorId: Map<string, number>;
  onSelect: (producto: ProductoCatalogo) => void;
  onInfo: (producto: ProductoCatalogo) => void;
}) {
  const grupos = useMemo(
    () => agruparProductosPorCategoria(productos, carta),
    [productos, carta],
  );

  const [abiertas, setAbiertas] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (grupos.length === 0) return;
    setAbiertas((prev) => {
      if (prev.size > 0) {
        const validas = new Set(grupos.map((g) => g.id));
        const filtradas = new Set([...prev].filter((id) => validas.has(id as never)));
        if (filtradas.size > 0) return filtradas;
      }
      return new Set([grupos[0].id]);
    });
  }, [grupos]);

  const toggle = (id: string) => {
    setAbiertas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sinCategoria = useMemo(
    () => productos.filter((p) => !p.categoriaCarta),
    [productos],
  );

  if (grupos.length === 0 && sinCategoria.length === 0) {
    if (productos.length === 0) return null;
    return (
      <GridProductos
        lista={productos}
        menu={menu}
        seccionPlatos={seccionPlatos}
        seccion={seccion}
        ventasPorId={ventasPorId}
        onSelect={onSelect}
        onInfo={onInfo}
      />
    );
  }

  return (
    <div className="space-y-2">
      {grupos.map((grupo) => (
        <CategoriaAcordeon
          key={grupo.id}
          id={grupo.id}
          label={grupo.label}
          count={
            listaSonBocadillos(grupo.productos)
              ? agruparBocadillos(grupo.productos).length
              : listaUsaGridTorradas(grupo.productos)
                ? agruparTorradas(grupo.productos).length
                : grupo.productos.length
          }
          abierta={abiertas.has(grupo.id)}
          onToggle={() => toggle(grupo.id)}
        >
          <GridProductos
            lista={grupo.productos}
            menu={menu}
            seccionPlatos={seccionPlatos}
            seccion={seccion}
            ventasPorId={ventasPorId}
            onSelect={onSelect}
            onInfo={onInfo}
          />
        </CategoriaAcordeon>
      ))}
      {sinCategoria.length > 0 && (
        <CategoriaAcordeon
          id="sin-categoria"
          label="Otros"
          count={sinCategoria.length}
          abierta={abiertas.has("sin-categoria")}
          onToggle={() => toggle("sin-categoria")}
        >
          <GridProductos
            lista={sinCategoria}
            menu={menu}
            seccionPlatos={seccionPlatos}
            seccion={seccion}
            ventasPorId={ventasPorId}
            onSelect={onSelect}
            onInfo={onInfo}
          />
        </CategoriaAcordeon>
      )}
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

  const cartaServicio: CartaServicio | null =
    origenACartaServicio(origen) ??
    (seccion === "bebidas" ? "bebidas" : null);

  const usarCategorias = Boolean(
    !modoBusqueda && !menuActivo && cartaServicio && activos.length > 0,
  );

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

    if (listaSonBocadillos(lista)) {
      return (
        <div className="space-y-4">
          {tituloBloque && (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {tituloBloque}
            </p>
          )}
          <GridBocadillos
            lista={lista}
            menu={menu}
            seccionPlatos={seccionPlatos}
            seccion={seccion}
            ventasPorId={ventasPorId}
            onSelect={onSelect}
            onInfo={setFicha}
          />
        </div>
      );
    }

    if (listaUsaGridTorradas(lista)) {
      return (
        <div className="space-y-4">
          {tituloBloque && (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {tituloBloque}
            </p>
          )}
          <GridTorradas
            lista={lista}
            menu={menu}
            seccionPlatos={seccionPlatos}
            seccion={seccion}
            ventasPorId={ventasPorId}
            onSelect={onSelect}
            onInfo={setFicha}
          />
        </div>
      );
    }

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
        ) : usarCategorias && cartaServicio ? (
          <SelectorPorCategorias
            productos={activos}
            carta={cartaServicio}
            menu={menu}
            seccionPlatos={seccionPlatos}
            seccion={seccion}
            ventasPorId={ventasPorId}
            onSelect={onSelect}
            onInfo={setFicha}
          />
        ) : origen === "menu" ? (
          <GridProductos
            lista={activos}
            menu={menu}
            seccionPlatos={seccionPlatos}
            seccion={seccion}
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
