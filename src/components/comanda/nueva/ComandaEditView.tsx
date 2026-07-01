"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BottomBar } from "@/components/ui/BottomBar";
import { CamareroSelector } from "@/components/comanda/CamareroSelector";
import { MesaSelector } from "@/components/comanda/MesaSelector";
import { CabeceraComanda } from "@/components/comanda/nueva/CabeceraComanda";
import { ExtrasMesaSection } from "@/components/comanda/nueva/ExtrasMesaSection";
import { ObservacionesSection } from "@/components/comanda/nueva/ObservacionesSection";
import { SeccionPlatosPanel } from "@/components/comanda/nueva/SeccionPlatosPanel";
import { SectionTabs, type TabComanda } from "@/components/comanda/nueva/SectionTabs";
import type { useComandaForm } from "@/hooks/useComandaForm";

type ComandaFormActions = ReturnType<typeof useComandaForm>;

interface ComandaEditViewProps {
  form: ComandaFormActions["form"];
  borradorRecuperado: boolean;
  esValido: boolean;
  onSetMesa: ComandaFormActions["setMesa"];
  onSetCamarero: ComandaFormActions["setCamarero"];
  onUpdatePlato: ComandaFormActions["updatePlato"];
  onAddPlato: ComandaFormActions["addPlato"];
  onRemovePlato: ComandaFormActions["removePlato"];
  onDuplicatePlato: ComandaFormActions["duplicatePlato"];
  onClearSeccion: ComandaFormActions["clearSeccion"];
  onToggleModificacion: ComandaFormActions["toggleModificacion"];
  onCycleSalsa: ComandaFormActions["cycleSalsa"];
  onCycleExtra: ComandaFormActions["cycleExtra"];
  onSetObservacion: ComandaFormActions["setObservacion"];
  onAddObservacion: ComandaFormActions["addObservacion"];
  onRemoveObservacion: ComandaFormActions["removeObservacion"];
  onObservacionRapida: ComandaFormActions["appendObservacionRapida"];
  onDescartarBorrador: ComandaFormActions["descartarBorrador"];
  onPreview: () => void;
}

function getValidationHint(form: ComandaFormActions["form"]): string | undefined {
  if (!form.mesa) return "Selecciona una mesa";
  if (!form.camareroId) return "Selecciona un camarero";
  return "Añade al menos un plato";
}

export function ComandaEditView({
  form,
  borradorRecuperado,
  esValido,
  onSetMesa,
  onSetCamarero,
  onUpdatePlato,
  onAddPlato,
  onRemovePlato,
  onDuplicatePlato,
  onClearSeccion,
  onToggleModificacion,
  onCycleSalsa,
  onCycleExtra,
  onSetObservacion,
  onAddObservacion,
  onRemoveObservacion,
  onObservacionRapida,
  onDescartarBorrador,
  onPreview,
}: ComandaEditViewProps) {
  const [tab, setTab] = useState<TabComanda>("mesa");

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

      <CabeceraComanda mesa={form.mesa} camareroId={form.camareroId} />
      <SectionTabs active={tab} onChange={setTab} />

      <div className="mt-4 space-y-4 pb-4">
        {tab === "mesa" && (
          <div className="space-y-6">
            <MesaSelector mesaSeleccionada={form.mesa} onSelect={onSetMesa} />
            <CamareroSelector
              camareroSeleccionado={form.camareroId}
              onSelect={onSetCamarero}
            />
          </div>
        )}

        {tab === "entrantes" && (
          <SeccionPlatosPanel
            titulo="Entrantes"
            seccion="entrantes"
            platos={form.entrantes}
            active
            onUpdate={(id, c) => onUpdatePlato("entrantes", id, c)}
            onAdd={() => onAddPlato("entrantes")}
            onRemove={(id) => onRemovePlato("entrantes", id)}
            onDuplicate={(id) => onDuplicatePlato("entrantes", id)}
            onClear={() => onClearSeccion("entrantes")}
            onToggleModificacion={(id, mod) =>
              onToggleModificacion("entrantes", id, mod)
            }
            onCycleSalsa={(id, salsa) => onCycleSalsa("entrantes", id, salsa)}
          />
        )}

        {tab === "primeros" && (
          <SeccionPlatosPanel
            titulo="Primeros"
            seccion="primeros"
            platos={form.primeros}
            conTipo
            active
            onUpdate={(id, c) => onUpdatePlato("primeros", id, c)}
            onAdd={() => onAddPlato("primeros")}
            onRemove={(id) => onRemovePlato("primeros", id)}
            onDuplicate={(id) => onDuplicatePlato("primeros", id)}
            onClear={() => onClearSeccion("primeros")}
            onToggleModificacion={(id, mod) =>
              onToggleModificacion("primeros", id, mod)
            }
            onCycleSalsa={(id, salsa) => onCycleSalsa("primeros", id, salsa)}
          />
        )}

        {tab === "segundos" && (
          <SeccionPlatosPanel
            titulo="Segundos"
            seccion="segundos"
            platos={form.segundos}
            conTipo
            active
            onUpdate={(id, c) => onUpdatePlato("segundos", id, c)}
            onAdd={() => onAddPlato("segundos")}
            onRemove={(id) => onRemovePlato("segundos", id)}
            onDuplicate={(id) => onDuplicatePlato("segundos", id)}
            onClear={() => onClearSeccion("segundos")}
            onToggleModificacion={(id, mod) =>
              onToggleModificacion("segundos", id, mod)
            }
            onCycleSalsa={(id, salsa) => onCycleSalsa("segundos", id, salsa)}
          />
        )}

        {tab === "bebidas" && (
          <SeccionPlatosPanel
            titulo="Bebidas"
            seccion="bebidas"
            platos={form.bebidas}
            active
            onUpdate={(id, c) => onUpdatePlato("bebidas", id, c)}
            onAdd={() => onAddPlato("bebidas")}
            onRemove={(id) => onRemovePlato("bebidas", id)}
            onDuplicate={(id) => onDuplicatePlato("bebidas", id)}
            onClear={() => onClearSeccion("bebidas")}
            onToggleModificacion={(id, mod) =>
              onToggleModificacion("bebidas", id, mod)
            }
            onCycleSalsa={(id, salsa) => onCycleSalsa("bebidas", id, salsa)}
          />
        )}

        {tab === "extras" && (
          <ExtrasMesaSection extras={form.extras} onCycle={onCycleExtra} />
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
