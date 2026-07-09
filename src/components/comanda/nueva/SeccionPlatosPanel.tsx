"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionCard } from "@/components/ui/SectionCard";
import { ProductosRapidosGrid } from "@/components/catalogo/ProductosRapidosGrid";
import { CatalogoBuscadorRapido } from "@/components/catalogo/CatalogoBuscadorRapido";
import { PlatoCard } from "@/components/comanda/nueva/PlatoCard";
import { PlatoRapidoSheet } from "@/components/comanda/nueva/PlatoRapidoSheet";
import { TicketCompacto } from "@/components/comanda/nueva/TicketCompacto";
import { OrigenPlatosSelector } from "@/components/comanda/nueva/OrigenPlatosSelector";
import { platoTieneContenido } from "@/lib/comanda/plato-factory";
import { useMenuDia } from "@/hooks/useMenuDia";
import type { OrigenPlatos } from "@/lib/carta/carta-admin";
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

function origenInicial(
  seccion: SeccionPlatos,
  menuActivo: boolean,
): OrigenPlatos {
  if ((seccion === "primeros" || seccion === "segundos") && menuActivo) {
    return "menu";
  }
  return "carta-almuerzo";
}

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
  onConfirmPlato: (plato: PlatoFormItem) => void;
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
  onConfirmPlato,
  onRemove,
  onDuplicate,
  onClear,
  onToggleModificacion,
  onCycleSalsa,
}: SeccionPlatosPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [productoRapido, setProductoRapido] = useState<ProductoCatalogo | null>(
    null,
  );
  const [platoEditando, setPlatoEditando] = useState<PlatoFormItem | null>(
    null,
  );
  const [ticketExpandido, setTicketExpandido] = useState(false);
  const { menu } = useMenuDia();
  const [origen, setOrigen] = useState<OrigenPlatos>(() =>
    origenInicial(seccion, menu?.activo ?? false),
  );

  const conSelectorOrigen =
    seccion === "entrantes" || seccion === "primeros" || seccion === "segundos";

  const abrirRapido = (producto: ProductoCatalogo) => {
    if (!producto.activo || producto.agotado) return;
    setPlatoEditando(null);
    setProductoRapido(producto);
  };

  const abrirEdicion = (plato: PlatoFormItem) => {
    setProductoRapido(null);
    setPlatoEditando(plato);
  };

  const guardarEdicion = (plato: PlatoFormItem) => {
    onUpdate(plato.id, plato);
  };

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
        <TicketCompacto
          platos={platos}
          expandido={ticketExpandido}
          onToggle={() => setTicketExpandido((v) => !v)}
          onEditarPlato={abrirEdicion}
        />

        {onBusquedaChange && (
          <CatalogoBuscadorRapido
            value={busqueda}
            onChange={onBusquedaChange}
            className="mb-4"
          />
        )}

        {conSelectorOrigen && (
          <OrigenPlatosSelector
            value={origen}
            onChange={setOrigen}
            incluirMenu={seccion === "primeros" || seccion === "segundos"}
          />
        )}

        <ProductosRapidosGrid
          seccion={SECCION_A_CATALOGO[seccion]}
          seccionPlatos={seccion}
          alcanceSecciones={ALCANCE_COMANDA}
          busqueda={busqueda}
          origen={conSelectorOrigen ? origen : undefined}
          onSelect={abrirRapido}
        />

        {ticketExpandido && (
          <div className="mt-4 space-y-3">
            {platos.filter(platoTieneContenido).map((plato, index) => (
              <PlatoCard
                key={plato.id}
                plato={plato}
                indice={index}
                conTipo={conTipo}
                inicioExpandido
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
        )}
      </SectionCard>

      {productoRapido && (
        <PlatoRapidoSheet
          producto={productoRapido}
          seccion={seccion}
          conTipo={conTipo}
          modo="añadir"
          onCerrar={() => setProductoRapido(null)}
          onConfirmar={onConfirmPlato}
        />
      )}

      {platoEditando && (
        <PlatoRapidoSheet
          platoInicial={platoEditando}
          seccion={seccion}
          conTipo={conTipo}
          modo="editar"
          onCerrar={() => setPlatoEditando(null)}
          onConfirmar={guardarEdicion}
        />
      )}

      <ConfirmDialog
        open={confirmClear}
        title={`¿Limpiar ${titulo.toLowerCase()}?`}
        message="Se eliminarán todos los platos de esta sección."
        confirmLabel="Limpiar sección"
        onConfirm={() => {
          onClear();
          setConfirmClear(false);
          setTicketExpandido(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}
