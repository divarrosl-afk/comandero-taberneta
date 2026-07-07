"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductoCartaEditor } from "@/components/carta/ProductoCartaEditor";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useCatalogo } from "@/hooks/useCatalogo";
import {
  categoriasDeCarta,
  productoEnCategoria,
  productoPerteneceACarta,
} from "@/lib/carta/carta-admin";
import {
  CARTAS_SERVICIO,
  labelCategoriaCarta,
  labelTipoProducto,
  nombreBoton,
  precioCartaDe,
  type CartaServicio,
  type CategoriaCarta,
  type ProductoCatalogo,
} from "@/types/catalogo";

export function CartaConfigClient() {
  const {
    productos,
    agregar,
    actualizar,
    eliminar,
    restaurarDefault,
    crearProductoVacio,
  } = useCatalogo();

  const [carta, setCarta] = useState<CartaServicio>("almuerzo");
  const categorias = categoriasDeCarta(carta);
  const [categoria, setCategoria] = useState<CategoriaCarta>(
    categorias[0]?.id ?? "tapas",
  );
  const [editando, setEditando] = useState<ProductoCatalogo | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const productosCarta = useMemo(
    () => productos.filter((p) => productoPerteneceACarta(p, carta)),
    [productos, carta],
  );

  const lista = productosCarta
    .filter((p) => productoEnCategoria(p, categoria))
    .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"));

  const cambiarCarta = (nueva: CartaServicio) => {
    setCarta(nueva);
    const cats = categoriasDeCarta(nueva);
    setCategoria(cats[0]?.id ?? "tapas");
    setEditando(null);
    setNuevo(false);
  };

  const handleGuardarNuevo = () => {
    if (!editando?.nombre.trim()) return;
    agregar({
      ...editando,
      cartaServicio: carta,
      categoriaCarta: categoria,
      tipo: "carta",
    });
    setEditando(null);
    setNuevo(false);
  };

  const handleGuardarEdit = () => {
    if (!editando?.nombre.trim()) return;
    actualizar(editando.id, editando);
    setEditando(null);
  };

  const seccionParaNuevo = () => {
    if (carta === "bebidas") return "bebidas" as const;
    if (carta === "postres") return "postres" as const;
    if (categoria === "extrasSuplementos") return "extras" as const;
    if (categoria === "ensaladas") return "primeros" as const;
    if (
      categoria === "hamburguesas" ||
      categoria === "carnesGuisadas" ||
      categoria === "carnesBrasa" ||
      categoria === "brasa" ||
      categoria === "infantil"
    ) {
      return "segundos" as const;
    }
    return "entrantes" as const;
  };

  const iniciarNuevo = () => {
    setNuevo(true);
    const base = crearProductoVacio(seccionParaNuevo());
    const esCafe =
      categoria === "cafes" ||
      categoria === "carajillos" ||
      categoria === "infusiones";
    setEditando({
      ...base,
      tipo: "carta",
      cartaServicio: carta,
      categoriaCarta: categoria,
      usosComanda: esCafe ? [] : categoria === "postres" ? ["postres"] : base.usosComanda,
    });
  };

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-4 pb-8">
      <header className="mb-4">
        <Link
          href="/"
          className="mb-2 inline-block text-sm font-semibold text-accent"
        >
          ← Inicio
        </Link>
        <h1 className="text-2xl font-bold text-primary">Edición de carta</h1>
        <p className="mt-1 text-sm text-muted">
          {productos.length} productos · precios, ingredientes y alérgenos
        </p>
        <Link
          href="/configuracion/menu-dia"
          className="mt-2 inline-block text-sm font-semibold text-accent underline"
        >
          Configurar menú del día →
        </Link>
      </header>

      <nav className="mb-4 flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CARTAS_SERVICIO.map((c) => {
          const count = productos.filter((p) =>
            productoPerteneceACarta(p, c.id),
          ).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => cambiarCarta(c.id)}
              className={[
                "shrink-0 rounded-xl px-3 py-2.5 text-sm font-bold transition active:scale-95",
                carta === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground",
              ].join(" ")}
            >
              {c.label}
              <span className="ml-1 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </nav>

      <nav className="mb-4 flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categorias.map((cat) => {
          const count = productosCarta.filter((p) =>
            productoEnCategoria(p, cat.id),
          ).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategoria(cat.id);
                setEditando(null);
                setNuevo(false);
              }}
              className={[
                "shrink-0 rounded-xl px-3 py-2 text-sm font-bold transition active:scale-95",
                categoria === cat.id
                  ? "bg-accent text-white"
                  : "bg-card text-foreground",
              ].join(" ")}
            >
              {cat.label}
              <span className="ml-1 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </nav>

      <div className="mb-4">
        <Button variant="outline" size="sm" fullWidth onClick={iniciarNuevo}>
          + Añadir en {labelCategoriaCarta(carta, categoria).toLowerCase()}
        </Button>
      </div>

      {nuevo && editando && (
        <div className="mb-4">
          <ProductoCartaEditor
            producto={editando}
            onChange={(c) => setEditando({ ...editando, ...c })}
            onGuardar={handleGuardarNuevo}
            onCancelar={() => {
              setNuevo(false);
              setEditando(null);
            }}
          />
        </div>
      )}

      <div className="space-y-2">
        {lista.length === 0 && !nuevo && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted">
            No hay productos en {labelCategoriaCarta(carta, categoria).toLowerCase()}
          </p>
        )}

        {lista.map((producto) =>
          editando?.id === producto.id && !nuevo ? (
            <ProductoCartaEditor
              key={producto.id}
              producto={editando}
              onChange={(c) => setEditando({ ...editando, ...c })}
              onGuardar={handleGuardarEdit}
              onCancelar={() => setEditando(null)}
            />
          ) : (
            <article
              key={producto.id}
              className={[
                "flex items-center gap-3 rounded-xl border-2 bg-card p-3",
                producto.activo ? "border-border" : "border-dashed opacity-60",
                producto.agotado ? "bg-stone-50" : "",
              ].join(" ")}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {producto.favorito && (
                    <span className="mr-1 text-accent">★</span>
                  )}
                  {nombreBoton(producto)}
                </p>
                <p className="text-xs text-muted">
                  {labelTipoProducto(producto.tipo)}
                  {precioCartaDe(producto)
                    ? ` · ${precioCartaDe(producto)}€`
                    : producto.precioCarta === 0
                      ? " · Sin cargo"
                      : ""}
                  {!producto.activo && " · Inactivo"}
                  {producto.agotado && " · Agotado"}
                </p>
                {producto.descripcionCamarero && (
                  <p className="mt-1 text-xs text-muted">
                    {producto.descripcionCamarero}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setEditando({ ...producto })}
                  className="min-h-10 rounded-lg border border-border px-3 text-sm font-semibold"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(producto.id)}
                  className="min-h-10 rounded-lg border border-red-200 px-3 text-sm text-red-600"
                >
                  ×
                </button>
              </div>
            </article>
          ),
        )}
      </div>

      <div className="mt-8">
        <Button
          variant="ghost"
          fullWidth
          onClick={() => setConfirmReset(true)}
          className="text-muted"
        >
          Restaurar carta por defecto
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="¿Eliminar producto?"
        message="Se quitará de la carta y de los botones rápidos."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (confirmDelete) eliminar(confirmDelete);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        open={confirmReset}
        title="¿Restaurar carta?"
        message="Se perderán todos los cambios y volverá el catálogo oficial del restaurante."
        confirmLabel="Restaurar"
        onConfirm={() => {
          restaurarDefault();
          setConfirmReset(false);
          setEditando(null);
          setNuevo(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </main>
  );
}
