"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { BottomBar } from "@/components/ui/BottomBar";
import { MesaSelector } from "@/components/comanda/MesaSelector";
import { CabeceraComanda } from "@/components/comanda/nueva/CabeceraComanda";
import { ExtrasMesaSection } from "@/components/comanda/nueva/ExtrasMesaSection";
import { ObservacionesSection } from "@/components/comanda/nueva/ObservacionesSection";
import { SeccionPlatosPanel } from "@/components/comanda/nueva/SeccionPlatosPanel";
import { SectionTabs, type TabComanda } from "@/components/comanda/nueva/SectionTabs";
import { CafesSeccionPanel } from "@/components/postres/nueva/CafesSeccionPanel";
import { PostresSeccionPanel } from "@/components/postres/nueva/PostresSeccionPanel";
import { ComensalesRapido } from "@/components/comanda/nueva/ComensalesRapido";
import type { useComandaForm } from "@/hooks/useComandaForm";
import {
  formTieneContenidoCocina,
  formTienePostresOCafes,
} from "@/lib/comanda/map-form";
import type { SeccionPlatos } from "@/types/comanda";

type ComandaFormActions = ReturnType<typeof useComandaForm>;

interface ComandaEditViewProps {
  form: ComandaFormActions["form"];
  borradorRecuperado: boolean;
  esValido: boolean;
  onSetMesa: ComandaFormActions["setMesa"];
  onSetComensales: ComandaFormActions["setComensales"];
  onUpdatePlato: ComandaFormActions["updatePlato"];
  onAddPlato: ComandaFormActions["addPlato"];
  onConfirmPlato: ComandaFormActions["confirmPlato"];
  onRemovePlato: ComandaFormActions["removePlato"];
  onDuplicatePlato: ComandaFormActions["duplicatePlato"];
  onClearSeccion: ComandaFormActions["clearSeccion"];
  onToggleModificacion: ComandaFormActions["toggleModificacion"];
  onCycleSalsa: ComandaFormActions["cycleSalsa"];
  onSetExtraCantidad: ComandaFormActions["setExtraCantidad"];
  onUpdatePostre: ComandaFormActions["updatePostre"];
  onAddPostre: ComandaFormActions["addPostre"];
  onAddPostreFrecuente: ComandaFormActions["addPostreFrecuente"];
  onRemovePostre: ComandaFormActions["removePostre"];
  onDuplicatePostre: ComandaFormActions["duplicatePostre"];
  onClearPostres: ComandaFormActions["clearPostres"];
  onUpdateCafe: ComandaFormActions["updateCafe"];
  onAddCafe: ComandaFormActions["addCafe"];
  onAddCafeRapido: ComandaFormActions["addCafeRapido"];
  onRemoveCafe: ComandaFormActions["removeCafe"];
  onDuplicateCafe: ComandaFormActions["duplicateCafe"];
  onClearCafes: ComandaFormActions["clearCafes"];
  onSetObservacion: ComandaFormActions["setObservacion"];
  onAddObservacion: ComandaFormActions["addObservacion"];
  onRemoveObservacion: ComandaFormActions["removeObservacion"];
  onObservacionRapida: ComandaFormActions["appendObservacionRapida"];
  onDescartarBorrador: ComandaFormActions["descartarBorrador"];
  onPreview: () => void;
}

function getValidationHint(form: ComandaFormActions["form"]): string | undefined {
  if (!form.mesa) return "Selecciona una mesa";
  return "Añade al menos un plato, bebida, postre, café, extra u observación";
}

function panelPlatos(
  titulo: string,
  seccion: SeccionPlatos,
  props: ComandaEditViewProps,
  conTipo = false,
  busqueda: string,
  onBusquedaChange: (v: string) => void,
) {
  return (
    <SeccionPlatosPanel
      titulo={titulo}
      seccion={seccion}
      platos={props.form[seccion]}
      conTipo={conTipo}
      active
      busqueda={busqueda}
      onBusquedaChange={onBusquedaChange}
      onUpdate={(id, c) => props.onUpdatePlato(seccion, id, c)}
      onAdd={() => props.onAddPlato(seccion)}
      onConfirmPlato={(plato) => props.onConfirmPlato(seccion, plato)}
      onRemove={(id) => props.onRemovePlato(seccion, id)}
      onDuplicate={(id) => props.onDuplicatePlato(seccion, id)}
      onClear={() => props.onClearSeccion(seccion)}
      onToggleModificacion={(id, mod) =>
        props.onToggleModificacion(seccion, id, mod)
      }
      onCycleSalsa={(id, sid, nom) => props.onCycleSalsa(seccion, id, sid, nom)}
    />
  );
}

export function ComandaEditView(props: ComandaEditViewProps) {
  const {
    form,
    borradorRecuperado,
    esValido,
    onSetMesa,
    onSetComensales,
    onSetExtraCantidad,
    onSetObservacion,
    onAddObservacion,
    onRemoveObservacion,
    onObservacionRapida,
    onDescartarBorrador,
    onPreview,
    onUpdatePostre,
    onAddPostre,
    onAddPostreFrecuente,
    onRemovePostre,
    onDuplicatePostre,
    onClearPostres,
    onUpdateCafe,
    onAddCafe,
    onAddCafeRapido,
    onRemoveCafe,
    onDuplicateCafe,
    onClearCafes,
  } = props;

  const [tab, setTab] = useState<TabComanda>("mesa");
  const [busqueda, setBusqueda] = useState("");
  const mesaPrevia = useRef<string | null>(form.mesa);

  useEffect(() => {
    if (form.mesa && !mesaPrevia.current) {
      setTab("entrantes");
    }
    mesaPrevia.current = form.mesa;
  }, [form.mesa]);

  const enviaCocina = formTieneContenidoCocina(form);
  const enviaPostres = formTienePostresOCafes(form);

  const handleSetMesa = (mesaId: string) => {
    onSetMesa(mesaId);
    setTab("entrantes");
  };

  return (
    <>
      <header className="mb-2">
        <Link
          href="/"
          className="mb-2 inline-block text-sm font-semibold text-accent"
        >
          ← Inicio
        </Link>
        <h1 className="text-2xl font-bold text-primary">Nueva comanda</h1>
        {enviaCocina && enviaPostres && (
          <p className="mt-1 text-xs text-muted">
            Se enviarán ticket cocina y ticket postres
          </p>
        )}
      </header>

      {borradorRecuperado && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">
            Borrador recuperado automáticamente
          </p>
          <button
            type="button"
            onClick={onDescartarBorrador}
            className="shrink-0 text-sm font-semibold text-amber-700 underline"
          >
            Descartar
          </button>
        </div>
      )}

      <CabeceraComanda
        mesa={form.mesa}
        comensales={form.comensales}
        onComensales={onSetComensales}
      />
      <SectionTabs
        active={tab}
        onChange={(t) => {
          setTab(t);
          setBusqueda("");
        }}
      />

      <div className="mt-4 space-y-4 pb-4">
        {tab === "mesa" && (
          <div className="space-y-4">
            <MesaSelector mesaSeleccionada={form.mesa} onSelect={handleSetMesa} />
            {form.mesa && (
              <ComensalesRapido
                value={form.comensales}
                onChange={onSetComensales}
              />
            )}
          </div>
        )}

        {tab === "entrantes" &&
          panelPlatos("Entrantes", "entrantes", props, false, busqueda, setBusqueda)}
        {tab === "primeros" &&
          panelPlatos("Primeros", "primeros", props, true, busqueda, setBusqueda)}
        {tab === "segundos" &&
          panelPlatos("Segundos", "segundos", props, true, busqueda, setBusqueda)}
        {tab === "bebidas" &&
          panelPlatos("Bebidas", "bebidas", props, false, busqueda, setBusqueda)}

        {tab === "postres" && (
          <PostresSeccionPanel
            postres={form.postres}
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            onUpdate={onUpdatePostre}
            onAdd={onAddPostre}
            onAddFrecuente={onAddPostreFrecuente}
            onRemove={onRemovePostre}
            onDuplicate={onDuplicatePostre}
            onClear={onClearPostres}
          />
        )}

        {tab === "cafes" && (
          <CafesSeccionPanel
            cafes={form.cafes}
            onUpdate={onUpdateCafe}
            onAdd={onAddCafe}
            onAddRapido={onAddCafeRapido}
            onRemove={onRemoveCafe}
            onDuplicate={onDuplicateCafe}
            onClear={onClearCafes}
          />
        )}

        {tab === "extras" && (
          <ExtrasMesaSection
            extras={form.extras}
            onSetCantidad={onSetExtraCantidad}
          />
        )}

        {tab === "observaciones" && (
          <ObservacionesSection
            observaciones={form.observaciones}
            onChange={onSetObservacion}
            onAdd={onAddObservacion}
            onRemove={onRemoveObservacion}
            onRapida={onObservacionRapida}
          />
        )}
      </div>

      <BottomBar hint={!esValido ? getValidationHint(form) : undefined}>
        <Button fullWidth size="lg" disabled={!esValido} onClick={onPreview}>
          Ver vista previa
        </Button>
      </BottomBar>
    </>
  );
}
