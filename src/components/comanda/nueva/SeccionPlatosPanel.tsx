"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionCard } from "@/components/ui/SectionCard";
import { ProductosRapidosGrid } from "@/components/catalogo/ProductosRapidosGrid";
import { CatalogoBuscadorRapido } from "@/components/catalogo/CatalogoBuscadorRapido";
import { PlatoCard } from "@/components/comanda/nueva/PlatoCard";
import type { SeccionCatalogo } from "@/types/catalogo";
import type {
  ModificacionId,
  PlatoFormItem,
  SeccionPlatos,
} from "@/types/comanda";
import type { ProductoCatalogo } from "@/types/catalogo";

const SECCION_A_CATALOGO: Record<SeccionPlatos, SeccionCatalogo> = {
  entrantes: "entrantes",
  primeros: "primeros",
  segundos: "segundos",
  bebidas: "bebidas",
};

const ALCANCE_COMANDA: SeccionCatalogo[] = [
  "entrantes",
  "primeros",
  "segundos",
  "bebidas",
];

interface SeccionPlatosPanelProps {
  titulo: string;
  seccion: SeccionPlatos;
  platos: PlatoFormItem[];
  conTipo?: boolean;
  active?: boolean;
  busqueda?: string;
  onBusquedaChange?: (value: string) => void;
  onUpdate: (id: string, cambios: Partial<PlatoFormItem>) => void;
  onAdd: () => void;
  onSelectCatalogo: (producto: ProductoCatalogo) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClear: () => void;
  onToggleModificacion: (platoId: string, mod: ModificacionId) => void;
  onCycleSalsa: (platoId: string, salsaId: string, nombre: string) => void;
}

export function SeccionPlatosPanel({
  titulo,
  seccion,
  platos,
  conTipo = false,
  active = false,
  busqueda = "",
  onBusquedaChange,
  onUpdate,
  onAdd,
  onSelectCatalogo,
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
        {onBusquedaChange && (
          <CatalogoBuscadorRapido
            value={busqueda}
            onChange={onBusquedaChange}
            className="mb-4"
          />
        )}

        <ProductosRapidosGrid
          seccion={SECCION_A_CATALOGO[seccion]}
          seccionPlatos={seccion}
          alcanceSecciones={ALCANCE_COMANDA}
          busqueda={busqueda}
          onSelect={onSelectCatalogo}
        />

        <div className="mt-4 space-y-3">
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
              onCycleSalsa={(id, nombre) => onCycleSalsa(plato.id, id, nombre)}
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
