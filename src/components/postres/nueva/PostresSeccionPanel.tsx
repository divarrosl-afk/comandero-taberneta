"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionCard } from "@/components/ui/SectionCard";
import { TicketPostresCompacto } from "@/components/comanda/nueva/TicketPostresCompacto";
import { PostreEditorSheet } from "@/components/postres/nueva/PostreEditorSheet";
import { PostresFrecuentesGrid } from "@/components/postres/nueva/PostresFrecuentesGrid";
import { CatalogoBuscadorRapido } from "@/components/catalogo/CatalogoBuscadorRapido";
import type { ProductoCatalogo } from "@/types/catalogo";
import type { PostreFormItem } from "@/types/postres";

interface PostresSeccionPanelProps {
  postres: PostreFormItem[];
  busqueda?: string;
  onBusquedaChange?: (value: string) => void;
  onUpdate: (id: string, cambios: Partial<PostreFormItem>) => void;
  onAddManual: () => string;
  onAddFrecuente: (producto: ProductoCatalogo) => string;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClear: () => void;
}

export function PostresSeccionPanel({
  postres,
  busqueda = "",
  onBusquedaChange,
  onUpdate,
  onAddManual,
  onAddFrecuente,
  onRemove,
  onDuplicate,
  onClear,
}: PostresSeccionPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [activoId, setActivoId] = useState<string | null>(null);

  const postreActivo = useMemo(
    () => postres.find((p) => p.id === activoId) ?? null,
    [postres, activoId],
  );

  return (
    <>
      <SectionCard
        title="Postres"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setActivoId(onAddManual())}>
              + Postre
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmClear(true)}
              className="text-muted"
            >
              Limpiar
            </Button>
          </div>
        }
      >
        <TicketPostresCompacto
          items={postres}
          activoId={activoId}
          etiqueta="Ticket postres"
          onEditar={(p) => setActivoId(p.id)}
        />

        {onBusquedaChange && (
          <CatalogoBuscadorRapido
            value={busqueda}
            onChange={onBusquedaChange}
            placeholder="Buscar postre, alérgeno…"
            className="mb-4"
          />
        )}

        <PostresFrecuentesGrid
          busqueda={busqueda}
          onSelect={(producto) => {
            const id = onAddFrecuente(producto);
            if (id) setActivoId(id);
          }}
        />
      </SectionCard>

      {postreActivo && (
        <PostreEditorSheet
          open
          titulo={postreActivo.nombre.trim() || "Postre"}
          postre={postreActivo}
          nombrePlaceholder="Nombre del postre"
          notaPlaceholder="Nota opcional (ej: sin nata)"
          onClose={() => setActivoId(null)}
          onAceptar={(cambios) => onUpdate(postreActivo.id, cambios)}
          onDuplicate={() => onDuplicate(postreActivo.id)}
          onRemove={() => {
            onRemove(postreActivo.id);
            setActivoId(null);
          }}
        />
      )}

      <ConfirmDialog
        open={confirmClear}
        title="¿Limpiar postres?"
        message="Se eliminarán todos los postres de esta comanda."
        confirmLabel="Limpiar"
        onConfirm={() => {
          onClear();
          setConfirmClear(false);
          setActivoId(null);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}
