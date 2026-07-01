"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useCatalogo } from "@/hooks/useCatalogo";
import {
  SECCIONES_CATALOGO,
  labelSeccion,
  type ProductoCatalogo,
  type SeccionCatalogo,
} from "@/types/catalogo";

function ProductoEditor({
  producto,
  onChange,
  onGuardar,
  onCancelar,
}: {
  producto: ProductoCatalogo;
  onChange: (c: Partial<ProductoCatalogo>) => void;
  onGuardar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border-2 border-primary/30 bg-background p-3">
      <input
        type="text"
        value={producto.nombre}
        onChange={(e) => onChange({ nombre: e.target.value })}
        placeholder="Nombre del producto"
        className="min-h-12 w-full rounded-xl border-2 border-border bg-card px-3 text-base font-medium outline-none focus:border-primary"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Precio € (opc.)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={producto.precio ?? ""}
            onChange={(e) =>
              onChange({
                precio: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Suplemento € (opc.)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={producto.suplemento ?? ""}
            onChange={(e) =>
              onChange({
                suplemento: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange({ favorito: !producto.favorito })}
          className={[
            "rounded-full border-2 px-4 py-2 text-sm font-semibold",
            producto.favorito
              ? "border-accent bg-accent text-white"
              : "border-border bg-card",
          ].join(" ")}
        >
          {producto.favorito ? "★ Favorito" : "☆ Marcar favorito"}
        </button>
        <button
          type="button"
          onClick={() => onChange({ activo: !producto.activo })}
          className={[
            "rounded-full border-2 px-4 py-2 text-sm font-semibold",
            producto.activo
              ? "border-green-300 bg-green-50 text-green-800"
              : "border-border bg-card text-muted",
          ].join(" ")}
        >
          {producto.activo ? "Activo" : "Inactivo"}
        </button>
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

export function CatalogoConfigClient() {
  const {
    productos,
    agregar,
    actualizar,
    eliminar,
    restaurarDefault,
    crearProductoVacio,
  } = useCatalogo();

  const [seccion, setSeccion] = useState<SeccionCatalogo>("entrantes");
  const [editando, setEditando] = useState<ProductoCatalogo | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const lista = productos
    .filter((p) => p.seccion === seccion)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const handleGuardarNuevo = () => {
    if (!editando?.nombre.trim()) return;
    agregar(editando);
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
    setEditando(crearProductoVacio(seccion));
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
        <h1 className="text-2xl font-bold text-primary">Catálogo de platos</h1>
        <p className="mt-1 text-sm text-muted">
          {productos.length} productos · localStorage
        </p>
      </header>

      <nav className="mb-4 flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECCIONES_CATALOGO.map((s) => {
          const count = productos.filter((p) => p.seccion === s.id).length;
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
                "shrink-0 rounded-xl px-3 py-2.5 text-sm font-bold transition active:scale-95",
                seccion === s.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground",
              ].join(" ")}
            >
              {s.label}
              <span className="ml-1 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </nav>

      <div className="mb-4 flex gap-2">
        <Button variant="outline" size="sm" fullWidth onClick={iniciarNuevo}>
          + Añadir {labelSeccion(seccion).toLowerCase()}
        </Button>
      </div>

      {nuevo && editando && (
        <div className="mb-4">
          <ProductoEditor
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
            <ProductoEditor
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
              ].join(" ")}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {producto.favorito && (
                    <span className="mr-1 text-accent">★</span>
                  )}
                  {producto.nombre}
                </p>
                <p className="text-xs text-muted">
                  {producto.precio ? `${producto.precio}€` : "—"}
                  {producto.suplemento
                    ? ` · Sup. +${producto.suplemento}€`
                    : ""}
                  {!producto.activo && " · Inactivo"}
                </p>
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
          Restaurar catálogo por defecto
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="¿Eliminar producto?"
        message="Se quitará del catálogo y de los botones rápidos."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (confirmDelete) eliminar(confirmDelete);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        open={confirmReset}
        title="¿Restaurar catálogo?"
        message="Se perderán todos los cambios y volverá el catálogo inicial."
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
