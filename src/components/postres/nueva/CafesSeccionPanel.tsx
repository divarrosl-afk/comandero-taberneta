"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionCard } from "@/components/ui/SectionCard";
import { TicketPostresCompacto } from "@/components/comanda/nueva/TicketPostresCompacto";
import { PostreEditorSheet } from "@/components/postres/nueva/PostreEditorSheet";
import { CafesFrecuentesGrid } from "@/components/postres/nueva/CafesFrecuentesGrid";
import type { PostreFormItem } from "@/types/postres";

interface CafesSeccionPanelProps {
  cafes: PostreFormItem[];
  onUpdate: (id: string, cambios: Partial<PostreFormItem>) => void;
  onAddManual: () => string;
  onAddRapido: (nombre: string) => string;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClear: () => void;
}

export function CafesSeccionPanel({
  cafes,
  onUpdate,
  onAddManual,
  onAddRapido,
  onRemove,
  onDuplicate,
  onClear,
}: CafesSeccionPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [activoId, setActivoId] = useState<string | null>(null);

  const cafeActivo = useMemo(
    () => cafes.find((c) => c.id === activoId) ?? null,
    [cafes, activoId],
  );

  return (
    <>
      <SectionCard
        title="Cafés e infusiones"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setActivoId(onAddManual())}>
              + Café
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
          items={cafes}
          activoId={activoId}
          etiqueta="Ticket cafés"
          onEditar={(p) => setActivoId(p.id)}
        />

        <CafesFrecuentesGrid
          onSelect={(nombre) => {
            const id = onAddRapido(nombre);
            if (id) setActivoId(id);
          }}
        />
      </SectionCard>

      {cafeActivo && (
        <PostreEditorSheet
          open
          titulo={cafeActivo.nombre.trim() || "Café"}
          postre={cafeActivo}
          nombrePlaceholder="Nombre del café"
          notaPlaceholder="Nota opcional (ej: con leche)"
          onClose={() => setActivoId(null)}
          onAceptar={(cambios) => onUpdate(cafeActivo.id, cambios)}
          onDuplicate={() => onDuplicate(cafeActivo.id)}
          onRemove={() => {
            onRemove(cafeActivo.id);
            setActivoId(null);
          }}
        />
      )}

      <ConfirmDialog
        open={confirmClear}
        title="¿Limpiar cafés?"
        message="Se eliminarán todos los cafés e infusiones de esta comanda."
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
