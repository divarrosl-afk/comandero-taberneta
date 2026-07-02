"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionCard } from "@/components/ui/SectionCard";
import { PostreCard } from "@/components/postres/nueva/PostreCard";
import { PostresFrecuentesGrid } from "@/components/postres/nueva/PostresFrecuentesGrid";
import { EstadoXSelector } from "@/components/postres/nueva/EstadoXSelector";
import { CatalogoBuscadorRapido } from "@/components/catalogo/CatalogoBuscadorRapido";
import type { ProductoCatalogo } from "@/types/catalogo";
import type { EstadoPostreX, PostreFormItem } from "@/types/postres";

interface PostresSeccionPanelProps {
  postres: PostreFormItem[];
  estadoX: EstadoPostreX | null;
  busqueda?: string;
  onBusquedaChange?: (value: string) => void;
  onUpdate: (id: string, cambios: Partial<PostreFormItem>) => void;
  onAdd: () => void;
  onAddFrecuente: (producto: ProductoCatalogo) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClear: () => void;
  onSetEstadoX: (estado: EstadoPostreX | null) => void;
}

export function PostresSeccionPanel({
  postres,
  estadoX,
  busqueda = "",
  onBusquedaChange,
  onUpdate,
  onAdd,
  onAddFrecuente,
  onRemove,
  onDuplicate,
  onClear,
  onSetEstadoX,
}: PostresSeccionPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <>
      <SectionCard
        title="Postres"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onAdd}>
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
        {onBusquedaChange && (
          <CatalogoBuscadorRapido
            value={busqueda}
            onChange={onBusquedaChange}
            placeholder="Buscar postre, alérgeno…"
            className="mb-4"
          />
        )}

        <PostresFrecuentesGrid busqueda={busqueda} onSelect={onAddFrecuente} />

        <div className="mt-4 space-y-3">
          {postres.map((postre, index) => (
            <PostreCard
              key={postre.id}
              postre={postre}
              indice={index}
              onChange={(cambios) => onUpdate(postre.id, cambios)}
              onRemove={() => onRemove(postre.id)}
              onDuplicate={() => onDuplicate(postre.id)}
            />
          ))}
        </div>
      </SectionCard>

      <EstadoXSelector value={estadoX} onChange={onSetEstadoX} />

      <ConfirmDialog
        open={confirmClear}
        title="¿Limpiar postres?"
        message="Se eliminarán todos los postres de esta comanda."
        confirmLabel="Limpiar"
        onConfirm={() => {
          onClear();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}
