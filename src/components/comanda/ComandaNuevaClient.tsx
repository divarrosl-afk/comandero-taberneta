"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense, useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ComandaEditView } from "@/components/comanda/nueva/ComandaEditView";
import { ComandaEnviadaView } from "@/components/comanda/nueva/ComandaEnviadaView";
import { PostresEnviadaView } from "@/components/postres/nueva/PostresEnviadaView";
import { ComandaPreviewView } from "@/components/comanda/nueva/ComandaPreviewView";
import { useAuth } from "@/contexts/AuthContext";
import { useComandaForm } from "@/hooks/useComandaForm";
import { formToComanda, formToComandaPostres } from "@/lib/comanda/map-form";
import { notificarComandaEnviada, marcarMesaOcupada } from "@/lib/mesas/estado-mesa";
import { limpiarBorrador } from "@/lib/storage/borrador-comanda";
import { guardarComanda, type PersistResult } from "@/lib/comandas/comandas-service";
import { guardarPostres } from "@/lib/postres/postres-service";
import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";

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
  const [envioPostres, setEnvioPostres] =
    useState<PersistResult<ComandaPostres> | null>(null);

  const comanda = useMemo(() => formToComanda(form), [form]);
  const comandaPostres = useMemo(() => formToComandaPostres(form), [form]);

  useEffect(() => {
    if (mesaParam) marcarMesaOcupada(mesaParam);
  }, [mesaParam]);

  const handleEnviar = async () => {
    if (!comanda && !comandaPostres) return;

    const username = sesion?.username ?? form.camareroId;
    let synced = true;
    const avisos: string[] = [];

    if (comanda) {
      const resultado = await guardarComanda(comanda, { camareroUsername: username });
      setEnvio(resultado);
      if (!resultado.synced) {
        synced = false;
        avisos.push("cocina");
      }
    } else {
      setEnvio(null);
    }

    if (comandaPostres) {
      const resultadoPostres = await guardarPostres(comandaPostres, {
        camareroUsername: username,
      });
      setEnvioPostres(resultadoPostres);
      if (!resultadoPostres.synced) {
        synced = false;
        avisos.push("postres");
      }
    } else {
      setEnvioPostres(null);
    }

    if (!synced) {
      setSyncAviso(
        `No se ha podido sincronizar (${avisos.join(" y ")}), guardado localmente.`,
      );
    } else {
      setSyncAviso(null);
    }

    const mesaId = comanda?.mesa ?? comandaPostres?.mesa;
    if (mesaId) notificarComandaEnviada(mesaId);
    limpiarBorrador();
    setStep("enviada");
  };

  const reintentarSync = async () => {
    const username = sesion?.username ?? form.camareroId;
    let ok = true;
    if (comanda) {
      const r = await guardarComanda(comanda, { camareroUsername: username });
      setEnvio(r);
      if (!r.synced) ok = false;
    }
    if (comandaPostres) {
      const rp = await guardarPostres(comandaPostres, {
        camareroUsername: username,
      });
      setEnvioPostres(rp);
      if (!rp.synced) ok = false;
    }
    if (ok) {
      setSyncAviso(null);
    } else {
      setSyncAviso("No se ha podido sincronizar, guardado localmente.");
    }
    return ok;
  };

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-4 pb-32">
      {step === "editar" && (
        <ComandaEditView
          form={form}
          borradorRecuperado={borradorRecuperado}
          esValido={esValido}
          onSetMesa={formActions.setMesa}
          onSetComensales={formActions.setComensales}
          onUpdatePlato={formActions.updatePlato}
          onAddPlato={formActions.addPlato}
          onConfirmPlato={formActions.confirmPlato}
          onRemovePlato={formActions.removePlato}
          onDuplicatePlato={formActions.duplicatePlato}
          onClearSeccion={formActions.clearSeccion}
          onSetExtraCantidad={formActions.setExtraCantidad}
          onUpdatePostre={formActions.updatePostre}
          onAddPostre={formActions.addPostre}
          onAddPostreFrecuente={formActions.addPostreFrecuente}
          onRemovePostre={formActions.removePostre}
          onDuplicatePostre={formActions.duplicatePostre}
          onClearPostres={formActions.clearPostres}
          onUpdateCafe={formActions.updateCafe}
          onAddCafe={formActions.addCafe}
          onAddCafeRapido={formActions.addCafeRapido}
          onRemoveCafe={formActions.removeCafe}
          onDuplicateCafe={formActions.duplicateCafe}
          onClearCafes={formActions.clearCafes}
          onSetObservacion={formActions.setObservacion}
          onAddObservacion={formActions.addObservacion}
          onRemoveObservacion={formActions.removeObservacion}
          onObservacionRapida={formActions.appendObservacionRapida}
          onDescartarBorrador={descartarBorrador}
          onPreview={() => setStep("preview")}
        />
      )}

      {step === "preview" && (comanda || comandaPostres) && (
        <ComandaPreviewView
          comanda={comanda}
          comandaPostres={comandaPostres}
          onEdit={() => setStep("editar")}
          onSend={handleEnviar}
        />
      )}

      {step === "enviada" && envio?.data && (
        <ComandaEnviadaView
          comanda={envio.data}
          comandaPostres={envioPostres?.data ?? null}
          synced={!syncAviso}
          onNueva={reset}
          syncAviso={syncAviso}
          onReintentarSync={reintentarSync}
        />
      )}

      {step === "enviada" && !envio?.data && envioPostres?.data && (
        <PostresEnviadaView
          comanda={envioPostres.data}
          synced={!syncAviso}
          onNueva={reset}
          syncAviso={syncAviso}
          onReintentarSync={reintentarSync}
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
