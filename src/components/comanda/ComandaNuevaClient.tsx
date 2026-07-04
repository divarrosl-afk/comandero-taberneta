"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ComandaEditView } from "@/components/comanda/nueva/ComandaEditView";
import { ComandaEnviadaView } from "@/components/comanda/nueva/ComandaEnviadaView";
import { ComandaPreviewView } from "@/components/comanda/nueva/ComandaPreviewView";
import { useAuth } from "@/contexts/AuthContext";
import { useComandaForm } from "@/hooks/useComandaForm";
import { formToComanda } from "@/lib/comanda/map-form";
import { notificarComandaEnviada, marcarMesaOcupada } from "@/lib/mesas/estado-mesa";
import { limpiarBorrador } from "@/lib/storage/borrador-comanda";
import { guardarComanda, type PersistResult } from "@/lib/comandas/comandas-service";
import type { ComandaCocina } from "@/types/comanda";

function ComandaNuevaForm() {
  const searchParams = useSearchParams();
  const mesaParam = searchParams.get("mesa");
  const { sesion } = useAuth();
  const formActions = useComandaForm(null, mesaParam);
  const {
    form,
    step,
    setStep,
    reset,
    esValido,
    borradorRecuperado,
    descartarBorrador,
  } = formActions;

  const [syncAviso, setSyncAviso] = useState<string | null>(null);
  const [envio, setEnvio] = useState<PersistResult<ComandaCocina> | null>(null);

  const comanda = useMemo(() => formToComanda(form), [form]);

  useEffect(() => {
    if (mesaParam) marcarMesaOcupada(mesaParam);
  }, [mesaParam]);

  const handleEnviar = async () => {
    if (!comanda) return;
    const resultado = await guardarComanda(comanda, {
      camareroUsername: sesion?.username ?? form.camareroId,
    });
    setEnvio(resultado);
    if (!resultado.synced) {
      setSyncAviso(
        "No se ha podido sincronizar, guardado localmente en este dispositivo.",
      );
    } else {
      setSyncAviso(null);
    }
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
          onSetMesa={formActions.setMesa}
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

      {step === "enviada" && comanda && envio && (
        <ComandaEnviadaView
          comanda={envio.data}
          synced={envio.synced}
          onNueva={reset}
          syncAviso={syncAviso}
          onReintentarSync={async () => {
            const r = await guardarComanda(comanda, {
              camareroUsername: sesion?.username ?? form.camareroId,
            });
            setEnvio(r);
            if (r.synced) {
              setSyncAviso(null);
            } else {
              setSyncAviso(
                r.error ??
                  "No se ha podido sincronizar, guardado localmente en este dispositivo.",
              );
            }
            return r.synced;
          }}
        />
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
