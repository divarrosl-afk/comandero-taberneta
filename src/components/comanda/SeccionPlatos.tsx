"use client";

import { Button } from "@/components/ui/Button";
import { PlatoEditor } from "@/components/comanda/PlatoEditor";
import type { PlatoFormItem } from "@/types/comanda";

interface SeccionPlatosProps {
  titulo: string;
  platos: PlatoFormItem[];
  conTipo?: boolean;
  onUpdate: (id: string, cambios: Partial<PlatoFormItem>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export function SeccionPlatos({
  titulo,
  platos,
  conTipo = false,
  onUpdate,
  onAdd,
  onRemove,
}: SeccionPlatosProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold uppercase tracking-wide">{titulo}</h2>
        <Button variant="outline" onClick={onAdd} className="min-h-10 px-3 text-sm">
          + Añadir
        </Button>
      </div>

      <div className="space-y-3">
        {platos.map((plato) => (
          <PlatoEditor
            key={plato.id}
            plato={plato}
            conTipo={conTipo}
            onChange={(cambios) => onUpdate(plato.id, cambios)}
            onRemove={() => onRemove(plato.id)}
            puedeEliminar={platos.length > 1}
          />
        ))}
      </div>
    </section>
  );
}
