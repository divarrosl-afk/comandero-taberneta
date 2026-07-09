"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionCard } from "@/components/ui/SectionCard";
import { ProductosRapidosGrid } from "@/components/catalogo/ProductosRapidosGrid";
import { CatalogoBuscadorRapido } from "@/components/catalogo/CatalogoBuscadorRapido";
import { PlatoEditorSheet } from "@/components/comanda/nueva/PlatoEditorSheet";
import { TicketCompacto } from "@/components/comanda/nueva/TicketCompacto";
import { OrigenPlatosSelector } from "@/components/comanda/nueva/OrigenPlatosSelector";
import { useMenuDia } from "@/hooks/useMenuDia";
import type { OrigenPlatos } from "@/lib/carta/carta-admin";
import type { SeccionCatalogo, ProductoCatalogo } from "@/types/catalogo";
import type { PlatoFormItem, SeccionPlatos } from "@/types/comanda";

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

type EditorState =
  | { modo: "nuevo"; producto: ProductoCatalogo }
  | { modo: "editar"; platoId: string }
  | null;

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
  onConfirmPlato: (plato: PlatoFormItem) => string;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClear: () => void;
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
  onConfirmPlato,
  onRemove,
  onDuplicate,
  onClear,
}: SeccionPlatosPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [editor, setEditor] = useState<EditorState>(null);
  const { menu } = useMenuDia();
  const [origen, setOrigen] = useState<OrigenPlatos>(() =>
    origenInicial(seccion, menu?.activo ?? false),
  );

  const platoEditando = useMemo(() => {
    if (editor?.modo !== "editar") return null;
    return platos.find((p) => p.id === editor.platoId) ?? null;
  }, [editor, platos]);

  const activoId = editor?.modo === "editar" ? editor.platoId : null;

  const conSelectorOrigen =
    seccion === "entrantes" || seccion === "primeros" || seccion === "segundos";

  const abrirCatalogo = (producto: ProductoCatalogo) => {
    if (!producto.activo || producto.agotado) return;
    setEditor({ modo: "nuevo", producto });
  };

  const abrirManual = () => {
    const id = onAddManual();
    setEditor({ modo: "editar", platoId: id });
  };

  const cerrarEditor = () => setEditor(null);

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
          onEditarPlato={(p) => setEditor({ modo: "editar", platoId: p.id })}
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
          onSelect={abrirCatalogo}
        />
      </SectionCard>

      {editor?.modo === "nuevo" && (
        <PlatoEditorSheet
          open
          modo="nuevo"
          producto={editor.producto}
          seccion={seccion}
          conTipo={conTipo}
          nombrePlaceholder={PLACEHOLDER_NOMBRE[seccion]}
          onClose={cerrarEditor}
          onAceptarNuevo={(plato) => {
            onConfirmPlato(plato);
          }}
          onAceptarEditar={() => {}}
        />
      )}

      {editor?.modo === "editar" && platoEditando && (
        <PlatoEditorSheet
          open
          modo="editar"
          plato={platoEditando}
          seccion={seccion}
          conTipo={conTipo}
          nombrePlaceholder={PLACEHOLDER_NOMBRE[seccion]}
          onClose={cerrarEditor}
          onAceptarNuevo={() => {}}
          onAceptarEditar={(cambios) => onUpdate(platoEditando.id, cambios)}
          onDuplicate={() => onDuplicate(platoEditando.id)}
          onRemove={() => {
            onRemove(platoEditando.id);
            cerrarEditor();
          }}
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
          cerrarEditor();
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}
