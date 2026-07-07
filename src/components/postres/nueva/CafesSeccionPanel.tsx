"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionCard } from "@/components/ui/SectionCard";
import { PostreCard } from "@/components/postres/nueva/PostreCard";
import { CafesFrecuentesGrid } from "@/components/postres/nueva/CafesFrecuentesGrid";
import type { PostreFormItem } from "@/types/postres";
import { scrollSeccionAlInicio } from "@/lib/ui/scroll-seccion";

interface CafesSeccionPanelProps {
  cafes: PostreFormItem[];
  onUpdate: (id: string, cambios: Partial<PostreFormItem>) => void;
  onAdd: () => void;
  onAddRapido: (nombre: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClear: () => void;
}

export function CafesSeccionPanel({
  cafes,
  onUpdate,
  onAdd,
  onAddRapido,
  onRemove,
  onDuplicate,
  onClear,
}: CafesSeccionPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const catalogoRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <SectionCard
        title="Cafés e infusiones"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onAdd}>
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
        <div ref={catalogoRef} className="scroll-mt-28">
        <CafesFrecuentesGrid onSelect={onAddRapido} />
        </div>

        <div className="mt-4 space-y-3">
          {cafes.map((cafe, index) => (
            <PostreCard
              key={cafe.id}
              postre={cafe}
              indice={index}
              onColapsar={() => scrollSeccionAlInicio(catalogoRef.current)}
              onChange={(cambios) => onUpdate(cafe.id, cambios)}
              onRemove={() => onRemove(cafe.id)}
              onDuplicate={() => onDuplicate(cafe.id)}
            />
          ))}
        </div>
      </SectionCard>

      <ConfirmDialog
        open={confirmClear}
        title="¿Limpiar cafés?"
        message="Se eliminarán todos los cafés e infusiones de esta comanda."
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
