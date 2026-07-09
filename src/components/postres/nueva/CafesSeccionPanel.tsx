"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionCard } from "@/components/ui/SectionCard";
import { TicketPostresCompacto } from "@/components/comanda/nueva/TicketPostresCompacto";
import { PostreCard } from "@/components/postres/nueva/PostreCard";
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

        {cafeActivo && (
          <div className="mb-4">
            <PostreCard
              postre={cafeActivo}
              indice={cafes.findIndex((c) => c.id === cafeActivo.id)}
              modoEditor
              nombrePlaceholder="Nombre del café"
              notaPlaceholder="Nota opcional (ej: con leche)"
              onCerrarEditor={() => setActivoId(null)}
              onChange={(cambios) => onUpdate(cafeActivo.id, cambios)}
              onRemove={() => {
                onRemove(cafeActivo.id);
                setActivoId(null);
              }}
              onDuplicate={() => onDuplicate(cafeActivo.id)}
            />
          </div>
        )}

        <CafesFrecuentesGrid
          onSelect={(nombre) => {
            const id = onAddRapido(nombre);
            if (id) setActivoId(id);
          }}
        />
      </SectionCard>

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
