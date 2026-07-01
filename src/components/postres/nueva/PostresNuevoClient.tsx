"use client";

import { useMemo } from "react";
import { PostresEditView } from "@/components/postres/nueva/PostresEditView";
import { PostresEnviadaView } from "@/components/postres/nueva/PostresEnviadaView";
import { PostresPreviewView } from "@/components/postres/nueva/PostresPreviewView";
import { usePostresForm } from "@/hooks/usePostresForm";
import { formToComandaPostres } from "@/lib/postres/map-form";
import { limpiarBorradorPostres } from "@/lib/storage/borrador-postres";
import { guardarPostresLocal } from "@/lib/storage/postres-local";

export function PostresNuevoClient() {
  const formActions = usePostresForm();
  const {
    form,
    step,
    setStep,
    reset,
    esValido,
    borradorRecuperado,
    descartarBorrador,
  } = formActions;

  const comanda = useMemo(() => formToComandaPostres(form), [form]);

  const handleEnviar = () => {
    if (!comanda) return;
    guardarPostresLocal(comanda);
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
          onSetCamarero={formActions.setCamarero}
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
        <PostresEnviadaView comanda={comanda} onNueva={reset} />
      )}
    </main>
  );
}
