"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionCard } from "@/components/ui/SectionCard";
import { PlatoCard } from "@/components/comanda/nueva/PlatoCard";
import type {
  ModificacionId,
  PlatoFormItem,
  SalsaId,
  SeccionPlatos,
} from "@/types/comanda";

interface SeccionPlatosPanelProps {
  titulo: string;
  seccion: SeccionPlatos;
  platos: PlatoFormItem[];
  conTipo?: boolean;
  active?: boolean;
  onUpdate: (id: string, cambios: Partial<PlatoFormItem>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClear: () => void;
  onToggleModificacion: (platoId: string, mod: ModificacionId) => void;
  onCycleSalsa: (platoId: string, salsaId: SalsaId) => void;
}

export function SeccionPlatosPanel({
  titulo,
  platos,
  conTipo = false,
  active = false,
  onUpdate,
  onAdd,
  onRemove,
  onDuplicate,
  onClear,
  onToggleModificacion,
  onCycleSalsa,
}: SeccionPlatosPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <>
      <SectionCard
        title={titulo}
        active={active}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onAdd}>
              + Plato
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
        <div className="space-y-3">
          {platos.map((plato, index) => (
            <PlatoCard
              key={plato.id}
              plato={plato}
              indice={index}
              conTipo={conTipo}
              onChange={(cambios) => onUpdate(plato.id, cambios)}
              onRemove={() => onRemove(plato.id)}
              onDuplicate={() => onDuplicate(plato.id)}
              onToggleModificacion={(mod) =>
                onToggleModificacion(plato.id, mod)
              }
              onCycleSalsa={(salsaId) => onCycleSalsa(plato.id, salsaId)}
            />
          ))}
        </div>
      </SectionCard>

      <ConfirmDialog
        open={confirmClear}
        title={`¿Limpiar ${titulo.toLowerCase()}?`}
        message="Se eliminarán todos los platos de esta sección."
        confirmLabel="Limpiar sección"
        onConfirm={() => {
          onClear();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}
