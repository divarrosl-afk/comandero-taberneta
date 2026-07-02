"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { PostresEditView } from "@/components/postres/nueva/PostresEditView";
import { PostresEnviadaView } from "@/components/postres/nueva/PostresEnviadaView";
import { PostresPreviewView } from "@/components/postres/nueva/PostresPreviewView";
import { useAuth } from "@/contexts/AuthContext";
import { usePostresForm } from "@/hooks/usePostresForm";
import { notificarComandaEnviada, marcarMesaOcupada } from "@/lib/mesas/estado-mesa";
import { formToComandaPostres } from "@/lib/postres/map-form";
import { limpiarBorradorPostres } from "@/lib/storage/borrador-postres";
import { guardarPostres } from "@/lib/postres/postres-service";

function PostresNuevoForm() {
  const searchParams = useSearchParams();
  const mesaParam = searchParams.get("mesa");
  const { sesion } = useAuth();
  const formActions = usePostresForm(null, mesaParam);
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

  const comanda = useMemo(() => formToComandaPostres(form), [form]);

  useEffect(() => {
    if (mesaParam) marcarMesaOcupada(mesaParam);
  }, [mesaParam]);

  const handleEnviar = async () => {
    if (!comanda) return;
    const resultado = await guardarPostres(comanda, {
      camareroUsername: sesion?.username ?? form.camareroId,
    });
    if (!resultado.synced) {
      setSyncAviso(
        "No se ha podido sincronizar, guardado localmente en este dispositivo.",
      );
    } else {
      setSyncAviso(null);
    }
    notificarComandaEnviada(comanda.mesa);
    limpiarBorradorPostres();
    setStep("enviada");
  };

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-4 pb-32">
      {step === "editar" && (
        <PostresEditView
          form={form}
          borradorRecuperado={borradorRecuperado}
          esValido={esValido}
          onSetMesa={formActions.setMesa}
          onUpdatePostre={formActions.updatePostre}
          onAddPostre={formActions.addPostre}
          onAddPostreFrecuente={formActions.addPostreFrecuente}
          onRemovePostre={formActions.removePostre}
          onDuplicatePostre={formActions.duplicatePostre}
          onClearPostres={formActions.clearPostres}
          onSetEstadoX={formActions.setEstadoX}
          onToggleClH={formActions.toggleClH}
          onSetObservacion={formActions.setObservacion}
          onAddObservacion={formActions.addObservacion}
          onRemoveObservacion={formActions.removeObservacion}
          onObservacionRapida={formActions.appendObservacionRapida}
          onDescartarBorrador={descartarBorrador}
          onPreview={() => setStep("preview")}
        />
      )}

      {step === "preview" && comanda && (
        <PostresPreviewView
          comanda={comanda}
          onEdit={() => setStep("editar")}
          onSend={handleEnviar}
        />
      )}

      {step === "enviada" && comanda && (
        <PostresEnviadaView
          comanda={comanda}
          onNueva={reset}
          syncAviso={syncAviso}
        />
      )}
    </main>
  );
}

export function PostresNuevoClient() {
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
          <PostresNuevoForm />
        )}
      </Suspense>
    </RequireAuth>
  );
}
