"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useEffect } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ComandaEditView } from "@/components/comanda/nueva/ComandaEditView";
import { ComandaEnviadaView } from "@/components/comanda/nueva/ComandaEnviadaView";
import { ComandaPreviewView } from "@/components/comanda/nueva/ComandaPreviewView";
import { useAuth } from "@/contexts/AuthContext";
import { useComandaForm } from "@/hooks/useComandaForm";
import { formToComanda } from "@/lib/comanda/map-form";
import { notificarComandaEnviada, marcarMesaOcupada } from "@/lib/mesas/estado-mesa";
import { limpiarBorrador } from "@/lib/storage/borrador-comanda";
import { guardarComandaLocal } from "@/lib/storage/comandas-local";

function ComandaNuevaForm() {
  const searchParams = useSearchParams();
  const mesaParam = searchParams.get("mesa");
  const { sesion, puedeCambiarCamarero } = useAuth();
  const camareroFijo = puedeCambiarCamarero ? null : (sesion?.camareroId ?? null);
  const formActions = useComandaForm(camareroFijo, mesaParam);
  const {
    form,
    step,
    setStep,
    reset,
    esValido,
    borradorRecuperado,
    descartarBorrador,
  } = formActions;

  const comanda = useMemo(() => formToComanda(form), [form]);

  useEffect(() => {
    if (mesaParam) marcarMesaOcupada(mesaParam);
  }, [mesaParam]);

  const handleEnviar = () => {
    if (!comanda) return;
    guardarComandaLocal(comanda);
    notificarComandaEnviada(comanda.mesa);
    limpiarBorrador();
    setStep("enviada");
  };

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-4 pb-32">
      {step === "editar" && (
        <ComandaEditView
          form={form}
          borradorRecuperado={borradorRecuperado}
          esValido={esValido}
          puedeCambiarCamarero={puedeCambiarCamarero}
          onSetMesa={formActions.setMesa}
          onSetCamarero={formActions.setCamarero}
          onUpdatePlato={formActions.updatePlato}
          onAddPlato={formActions.addPlato}
          onAddPlatoFromCatalog={formActions.addPlatoFromCatalog}
          onRemovePlato={formActions.removePlato}
          onDuplicatePlato={formActions.duplicatePlato}
          onClearSeccion={formActions.clearSeccion}
          onToggleModificacion={formActions.toggleModificacion}
          onCycleSalsa={formActions.cycleSalsa}
          onCycleExtra={formActions.cycleExtra}
          onSetObservacion={formActions.setObservacion}
          onAddObservacion={formActions.addObservacion}
          onRemoveObservacion={formActions.removeObservacion}
          onObservacionRapida={formActions.appendObservacionRapida}
          onDescartarBorrador={descartarBorrador}
          onPreview={() => setStep("preview")}
        />
      )}

      {step === "preview" && comanda && (
        <ComandaPreviewView
          comanda={comanda}
          onEdit={() => setStep("editar")}
          onSend={handleEnviar}
        />
      )}

      {step === "enviada" && comanda && (
        <ComandaEnviadaView comanda={comanda} onNueva={reset} />
      )}
    </main>
  );
}

export function ComandaNuevaClient() {
  const { listo } = useAuth();

  return (
    <RequireAuth>
      <Suspense
        fallback={
          <main className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-4">
            <p className="text-muted">Cargando…</p>
          </main>
        }
      >
        {!listo ? (
          <main className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-4">
            <p className="text-muted">Cargando…</p>
          </main>
        ) : (
          <ComandaNuevaForm />
        )}
      </Suspense>
    </RequireAuth>
  );
}
