"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProductosRapidosGrid } from "@/components/catalogo/ProductosRapidosGrid";
import { useAuth } from "@/contexts/AuthContext";
import { useCatalogo } from "@/hooks/useCatalogo";
import { createId } from "@/lib/id/create-id";
import { esProductoCafeCatalogo } from "@/data/cafes-catalogo";
import { nombreBoton, type ProductoCatalogo } from "@/types/catalogo";

interface PostresFrecuentesGridProps {
  busqueda?: string;
  onSelect: (producto: ProductoCatalogo) => void;
}

function esPostreDulce(producto: ProductoCatalogo): boolean {
  return (
    producto.categoriaCarta === "postres" ||
    (producto.seccion === "postres" && !esProductoCafeCatalogo(producto))
  );
}

export function PostresFrecuentesGrid({
  busqueda = "",
  onSelect,
}: PostresFrecuentesGridProps) {
  const { puedeConfigCarta } = useAuth();
  const { productos, agregar, eliminar, cargando } = useCatalogo();
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const postresCatalogo = useMemo(
    () =>
      productos
        .filter((p) => p.activo && esPostreDulce(p))
        .sort(
          (a, b) =>
            a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"),
        ),
    [productos],
  );

  const enBusqueda = busqueda.trim().length > 0;

  const handleGuardarNuevo = async () => {
    if (!nombreNuevo.trim()) return;
    setError(null);
    try {
      const maxOrden =
        postresCatalogo.reduce((max, p) => Math.max(max, p.orden), 0) + 10;
      await agregar({
        id: createId(),
        nombre: nombreNuevo.trim(),
        seccion: "postres",
        tipo: "carta",
        cartaServicio: "postres",
        categoriaCarta: "postres",
        usosComanda: ["postres"],
        activo: true,
        agotado: false,
        favorito: false,
        orden: maxOrden,
        ingredientes: [],
        alergenos: [],
        recomendado: false,
      });
      setNombreNuevo("");
      setMostrarAlta(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el postre");
    }
  };

  const handleEliminar = async (id: string) => {
    setError(null);
    try {
      await eliminar(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar el postre");
    }
  };

  if (enBusqueda) {
    return (
      <ProductosRapidosGrid
        seccion="postres"
        categoriaCarta="postres"
        alcanceSecciones={["postres"]}
        busqueda={busqueda}
        onSelect={onSelect}
      />
    );
  }

  if (cargando) {
    return (
      <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">
        Cargando catálogo de postres…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {puedeConfigCarta && (
        <>
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Modo admin: pulsa <strong>×</strong> para eliminar o{" "}
            <strong>+ Añadir</strong> para crear un postre nuevo.
          </p>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null);
                setMostrarAlta((v) => !v);
              }}
            >
              + Añadir postre
            </Button>
          </div>
          {mostrarAlta && (
            <div className="rounded-xl border-2 border-primary/30 bg-background p-3">
              <p className="mb-2 text-sm font-bold text-primary">Nuevo postre</p>
              <div className="flex gap-2">
                <input
                  value={nombreNuevo}
                  onChange={(e) => setNombreNuevo(e.target.value)}
                  placeholder="Nombre del postre"
                  className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-sm"
                />
                <Button
                  size="sm"
                  disabled={!nombreNuevo.trim()}
                  onClick={() => {
                    void handleGuardarNuevo();
                  }}
                >
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {postresCatalogo.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted">
          No hay postres en el catálogo.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {postresCatalogo.map((producto) => (
            <div key={producto.id} className="relative">
              <button
                type="button"
                onClick={() => onSelect(producto)}
                className="flex min-h-[4.25rem] w-full flex-col items-center justify-center rounded-2xl border-2 border-border bg-card px-2 py-2.5 text-center text-sm font-bold active:scale-[0.98]"
              >
                {nombreBoton(producto)}
              </button>
              {puedeConfigCarta && (
                <button
                  type="button"
                  aria-label={`Eliminar ${producto.nombre}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmDelete(producto.id);
                  }}
                  className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="¿Eliminar postre?"
        message="Se quitará del catálogo para todos los camareros."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (confirmDelete) void handleEliminar(confirmDelete);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
