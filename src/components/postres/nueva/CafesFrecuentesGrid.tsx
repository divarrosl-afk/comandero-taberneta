"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useCatalogo } from "@/hooks/useCatalogo";
import { createId } from "@/lib/id/create-id";
import {
  CATEGORIAS_CAFE_CATALOGO,
  etiquetaTicketDeProductoCafe,
} from "@/data/cafes-catalogo";
import type { CategoriaCarta, ProductoCatalogo } from "@/types/catalogo";

interface CafesFrecuentesGridProps {
  onSelect: (etiquetaTicket: string) => void;
}

function GrupoBotones({
  titulo,
  productos,
  admin,
  onSelect,
  onEliminar,
  onIniciarAlta,
}: {
  titulo: string;
  productos: ProductoCatalogo[];
  admin: boolean;
  onSelect: (etiqueta: string) => void;
  onEliminar: (id: string) => void;
  onIniciarAlta: () => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">
          {titulo}
        </p>
        {admin && (
          <Button variant="outline" size="sm" onClick={onIniciarAlta}>
            + Añadir
          </Button>
        )}
      </div>
      {productos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted">
          Sin productos en esta categoría.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {productos.map((producto) => {
            const ticket = etiquetaTicketDeProductoCafe(producto);
            return (
              <div key={producto.id} className="relative">
                <button
                  type="button"
                  onClick={() => onSelect(ticket)}
                  className="rounded-xl border-2 border-border bg-background px-3 py-2 text-left text-xs font-bold active:scale-95"
                >
                  <span className="font-mono text-accent">{ticket}</span>
                  <span className="mt-0.5 block font-normal capitalize text-muted">
                    {producto.nombre}
                  </span>
                </button>
                {admin && (
                  <button
                    type="button"
                    aria-label={`Eliminar ${producto.nombre}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEliminar(producto.id);
                    }}
                    className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CafesFrecuentesGrid({ onSelect }: CafesFrecuentesGridProps) {
  const { puedeConfigCarta } = useAuth();
  const { productos, agregar, eliminar, cargando } = useCatalogo();
  const [categoriaAlta, setCategoriaAlta] = useState<CategoriaCarta | null>(
    null,
  );
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [ticketNuevo, setTicketNuevo] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const porCategoria = useMemo(() => {
    const validos = productos.filter(
      (p) => p?.id && typeof p.nombre === "string",
    );
    const cafes = validos.filter((p) => p.activo && p.categoriaCarta === "cafes");
    const carajillos = validos.filter(
      (p) => p.activo && p.categoriaCarta === "carajillos",
    );
    const infusiones = validos.filter(
      (p) => p.activo && p.categoriaCarta === "infusiones",
    );
    const ordenar = (lista: ProductoCatalogo[]) =>
      [...lista].sort(
        (a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"),
      );
    return {
      cafes: ordenar(cafes),
      carajillos: ordenar(carajillos),
      infusiones: ordenar(infusiones),
    };
  }, [productos]);

  const handleGuardarNuevo = async () => {
    if (!categoriaAlta || !nombreNuevo.trim()) return;
    setError(null);
    const nombre = nombreNuevo.trim();
    const ticket = ticketNuevo.trim();
    const maxOrden =
      (porCategoria[
        categoriaAlta === "cafes"
          ? "cafes"
          : categoriaAlta === "carajillos"
            ? "carajillos"
            : "infusiones"
      ].reduce((max, p) => Math.max(max, p.orden ?? 0), 0) || 0) + 10;

    try {
      await agregar({
        id: createId(),
        nombre,
        nombreCorto: ticket && ticket !== nombre ? ticket : undefined,
        seccion: "postres",
        tipo: "carta",
        cartaServicio: "postres",
        categoriaCarta: categoriaAlta,
        usosComanda: [],
        activo: true,
        agotado: false,
        favorito: false,
        orden: maxOrden,
        ingredientes: [],
        alergenos: [],
        recomendado: false,
      });
      setCategoriaAlta(null);
      setNombreNuevo("");
      setTicketNuevo("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el producto");
    }
  };

  const handleEliminar = async (id: string) => {
    setError(null);
    try {
      await eliminar(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar el producto");
    }
  };

  if (cargando) {
    return (
      <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">
        Cargando catálogo de cafés…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {puedeConfigCarta && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Modo admin: pulsa <strong>×</strong> para eliminar o{" "}
          <strong>+ Añadir</strong> en cada categoría.
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {CATEGORIAS_CAFE_CATALOGO.map((cat) => (
        <GrupoBotones
          key={cat.id}
          titulo={cat.label}
          productos={
            cat.id === "cafes"
              ? porCategoria.cafes
              : cat.id === "carajillos"
                ? porCategoria.carajillos
                : porCategoria.infusiones
          }
          admin={puedeConfigCarta}
          onSelect={onSelect}
          onEliminar={(id) => setConfirmDelete(id)}
          onIniciarAlta={() => {
            setError(null);
            setCategoriaAlta(cat.id);
            setNombreNuevo("");
            setTicketNuevo("");
          }}
        />
      ))}

      {categoriaAlta && (
        <div className="rounded-xl border-2 border-primary/30 bg-background p-3">
          <p className="mb-2 text-sm font-bold text-primary">
            Nuevo en{" "}
            {CATEGORIAS_CAFE_CATALOGO.find((c) => c.id === categoriaAlta)?.label}
          </p>
          <div className="space-y-2">
            <input
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              placeholder="Nombre visible (ej: Café solo)"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              value={ticketNuevo}
              onChange={(e) => setTicketNuevo(e.target.value)}
              placeholder={
                categoriaAlta === "carajillos"
                  ? "Ticket (opcional, ej: CARAJ DE manzanilla)"
                  : categoriaAlta === "cafes"
                    ? "Texto en ticket (ej: C, C/L, Ç)"
                    : "Texto en ticket (opcional)"
              }
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  void handleGuardarNuevo();
                }}
                disabled={!nombreNuevo.trim()}
              >
                Guardar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCategoriaAlta(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="¿Eliminar producto?"
        message="Se quitará de los botones rápidos de cafés para todos los camareros."
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
