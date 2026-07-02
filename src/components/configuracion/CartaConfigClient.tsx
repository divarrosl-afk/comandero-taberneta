"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductoCartaEditor } from "@/components/carta/ProductoCartaEditor";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useCatalogo } from "@/hooks/useCatalogo";
import {
  productoPerteneceACarta,
  seccionesDeCarta,
} from "@/lib/carta/carta-admin";
import {
  CARTAS_SERVICIO,
  labelSeccion,
  labelTipoProducto,
  nombreBoton,
  precioCartaDe,
  type CartaServicio,
  type ProductoCatalogo,
  type SeccionCatalogo,
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
  const seccionesCarta = seccionesDeCarta(carta);
  const [seccion, setSeccion] = useState<SeccionCatalogo>(
    seccionesCarta[0]?.id ?? "entrantes",
  );
  const [editando, setEditando] = useState<ProductoCatalogo | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const cartaInfo = CARTAS_SERVICIO.find((c) => c.id === carta);
  const cartaDisponible = cartaInfo?.disponible ?? true;

  const productosCarta = useMemo(
    () => productos.filter((p) => productoPerteneceACarta(p, carta)),
    [productos, carta],
  );

  const lista = productosCarta
    .filter((p) => p.seccion === seccion)
    .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"));

  const cambiarCarta = (nueva: CartaServicio) => {
    setCarta(nueva);
    const secciones = seccionesDeCarta(nueva);
    setSeccion(secciones[0]?.id ?? "entrantes");
    setEditando(null);
    setNuevo(false);
  };

  const handleGuardarNuevo = () => {
    if (!editando?.nombre.trim()) return;
    agregar({
      ...editando,
      cartaServicio: carta === "cenas" ? "cenas" : carta,
    });
    setEditando(null);
    setNuevo(false);
  };

  const handleGuardarEdit = () => {
    if (!editando?.nombre.trim()) return;
    actualizar(editando.id, editando);
    setEditando(null);
  };

  const iniciarNuevo = () => {
    setNuevo(true);
    const base = crearProductoVacio(seccion);
    setEditando({
      ...base,
      tipo: "carta",
      cartaServicio: carta === "cenas" ? "cenas" : carta,
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
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link
            href="/configuracion/menu-dia"
            className="font-semibold text-accent underline"
          >
            Menú del día →
          </Link>
        </div>
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
              disabled={!c.disponible}
              onClick={() => cambiarCarta(c.id)}
              className={[
                "shrink-0 rounded-xl px-3 py-2.5 text-sm font-bold transition active:scale-95",
                carta === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground",
                !c.disponible ? "cursor-not-allowed opacity-50" : "",
              ].join(" ")}
            >
              {c.label}
              {c.disponible ? (
                <span className="ml-1 text-xs opacity-70">({count})</span>
              ) : (
                <span className="ml-1 text-[10px] font-medium opacity-70">
                  Próx.
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {!cartaDisponible ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted">
          La carta de cenas estará disponible cuando subas el PDF de noche.
        </p>
      ) : (
        <>
          {carta === "bebidas" && (
            <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Vinos: añádelos aquí cuando los tengas. Por ahora solo bebidas
              básicas.
            </p>
          )}

          {carta === "postres" && productosCarta.length === 0 && (
            <p className="mb-4 rounded-xl border border-dashed border-border px-3 py-2 text-sm text-muted">
              Sin postres todavía. Se cargarán desde la carta de vinos y postres.
            </p>
          )}

          <nav className="mb-4 flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {seccionesCarta.map((s) => {
              const count = productosCarta.filter((p) => p.seccion === s.id)
                .length;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSeccion(s.id);
                    setEditando(null);
                    setNuevo(false);
                  }}
                  className={[
                    "shrink-0 rounded-xl px-3 py-2 text-sm font-bold transition active:scale-95",
                    seccion === s.id
                      ? "bg-accent text-white"
                      : "bg-card text-foreground",
                  ].join(" ")}
                >
                  {s.label}
                  <span className="ml-1 text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </nav>

          <div className="mb-4">
            <Button variant="outline" size="sm" fullWidth onClick={iniciarNuevo}>
              + Añadir {labelSeccion(seccion).toLowerCase()}
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
                No hay productos en {labelSeccion(seccion).toLowerCase()}
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
                    producto.activo
                      ? "border-border"
                      : "border-dashed opacity-60",
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
                        ? ` · Carta ${precioCartaDe(producto)}€`
                        : producto.precioCarta === 0
                          ? " · Sin cargo"
                          : ""}
                      {producto.precioMenu
                        ? ` · Menú ${producto.precioMenu}€`
                        : ""}
                      {producto.suplemento
                        ? ` · Sup. +${producto.suplemento}€`
                        : ""}
                      {!producto.activo && " · Inactivo"}
                      {producto.agotado && " · Agotado"}
                    </p>
                    {producto.alergenos.length > 0 && (
                      <p className="mt-1 text-xs text-red-700">
                        {producto.alergenos.length} alérgeno(s)
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
        </>
      )}

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
        message="Se perderán todos los cambios y volverá la carta de almuerzo real con bebidas básicas."
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
