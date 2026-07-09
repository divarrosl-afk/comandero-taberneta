"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionCard } from "@/components/ui/SectionCard";
import { ProductosRapidosGrid } from "@/components/catalogo/ProductosRapidosGrid";
import { CatalogoBuscadorRapido } from "@/components/catalogo/CatalogoBuscadorRapido";
import { PlatoCard } from "@/components/comanda/nueva/PlatoCard";
import { TicketCompacto } from "@/components/comanda/nueva/TicketCompacto";
import { OrigenPlatosSelector } from "@/components/comanda/nueva/OrigenPlatosSelector";
import { useMenuDia } from "@/hooks/useMenuDia";
import type { OrigenPlatos } from "@/lib/carta/carta-admin";
import type { SeccionCatalogo, ProductoCatalogo } from "@/types/catalogo";
import type {
  ModificacionId,
  PlatoFormItem,
  SeccionPlatos,
} from "@/types/comanda";

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

const ETIQUETA_MANUAL: Record<SeccionPlatos, string> = {
  entrantes: "+ Entrante",
  primeros: "+ Primero",
  segundos: "+ Segundo",
  bebidas: "+ Bebida",
};

const PLACEHOLDER_NOMBRE: Record<SeccionPlatos, string> = {
  entrantes: "Nombre del entrante",
  primeros: "Nombre del primero",
  segundos: "Nombre del segundo",
  bebidas: "Nombre de la bebida",
};

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
  onAddManual: () => string;
  onConfirmDesdeCatalogo: (producto: ProductoCatalogo) => string;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClear: () => void;
  onTapModificacion: (platoId: string, mod: ModificacionId) => void;
  onSetModificacionCantidad: (
    platoId: string,
    mod: ModificacionId,
    cantidad: number,
  ) => void;
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
  onAddManual,
  onConfirmDesdeCatalogo,
  onRemove,
  onDuplicate,
  onClear,
  onTapModificacion,
  onSetModificacionCantidad,
  onCycleSalsa,
}: SeccionPlatosPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [activoId, setActivoId] = useState<string | null>(null);
  const { menu } = useMenuDia();
  const [origen, setOrigen] = useState<OrigenPlatos>(() =>
    origenInicial(seccion, menu?.activo ?? false),
  );

  const platoActivo = useMemo(
    () => platos.find((p) => p.id === activoId) ?? null,
    [platos, activoId],
  );

  const conSelectorOrigen =
    seccion === "entrantes" || seccion === "primeros" || seccion === "segundos";

  const abrirCatalogo = (producto: ProductoCatalogo) => {
    const id = onConfirmDesdeCatalogo(producto);
    if (id) setActivoId(id);
  };

  const abrirManual = () => {
    setActivoId(onAddManual());
  };

  return (
    <>
      <SectionCard
        title={titulo}
        active={active}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={abrirManual}>
              {ETIQUETA_MANUAL[seccion]}
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
          activoId={activoId}
          onEditarPlato={(p) => setActivoId(p.id)}
        />

        {platoActivo && (
          <div className="mb-4">
            <PlatoCard
              plato={platoActivo}
              indice={platos.findIndex((p) => p.id === platoActivo.id)}
              conTipo={conTipo}
              modoEditor
              nombrePlaceholder={PLACEHOLDER_NOMBRE[seccion]}
              onCerrarEditor={() => setActivoId(null)}
              onChange={(cambios) => onUpdate(platoActivo.id, cambios)}
              onRemove={() => {
                onRemove(platoActivo.id);
                setActivoId(null);
              }}
              onDuplicate={() => onDuplicate(platoActivo.id)}
              onTapModificacion={(mod) =>
                onTapModificacion(platoActivo.id, mod)
              }
              onSetModificacionCantidad={(mod, cantidad) =>
                onSetModificacionCantidad(platoActivo.id, mod, cantidad)
              }
              onCycleSalsa={(id, nombre) =>
                onCycleSalsa(platoActivo.id, id, nombre)
              }
            />
          </div>
        )}

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
          onSelect={abrirCatalogo}
        />
      </SectionCard>

      <ConfirmDialog
        open={confirmClear}
        title={`¿Limpiar ${titulo.toLowerCase()}?`}
        message="Se eliminarán todos los platos de esta sección."
        confirmLabel="Limpiar sección"
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
