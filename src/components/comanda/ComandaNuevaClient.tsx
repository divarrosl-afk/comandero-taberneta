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
import {
  formToComanda,
  formToComandaPanel,
  formToComandaPostres,
} from "@/lib/comanda/map-form";
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
  const [comandaImpresion, setComandaImpresion] = useState<ComandaCocina | null>(
    null,
  );

  const comandaTicket = useMemo(() => formToComanda(form), [form]);
  const comandaPanel = useMemo(() => formToComandaPanel(form), [form]);
  const comandaPostres = useMemo(() => formToComandaPostres(form), [form]);

  useEffect(() => {
    if (mesaParam) marcarMesaOcupada(mesaParam);
  }, [mesaParam]);

  const handleEnviar = async () => {
    if (!comandaTicket) return;

    const username = sesion?.username ?? form.camareroId;
    let synced = true;
    const avisos: string[] = [];

    setComandaImpresion(comandaTicket);

    if (comandaPanel) {
      const resultado = await guardarComanda(comandaPanel, {
        camareroUsername: username,
      });
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

    const mesaId = comandaTicket.mesa;
    if (mesaId) notificarComandaEnviada(mesaId);
    limpiarBorrador();
    setStep("enviada");
  };

  const reintentarSync = async () => {
    const username = sesion?.username ?? form.camareroId;
    let ok = true;
    if (comandaPanel) {
      const r = await guardarComanda(comandaPanel, { camareroUsername: username });
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

  const handleNueva = () => {
    setComandaImpresion(null);
    reset();
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

      {step === "preview" && comandaTicket && (
        <ComandaPreviewView
          comanda={comandaTicket}
          onEdit={() => setStep("editar")}
          onSend={handleEnviar}
        />
      )}

      {step === "enviada" && comandaImpresion && (
        <ComandaEnviadaView
          comanda={comandaImpresion}
          imprimirPostresSeparado={false}
          synced={!syncAviso}
          onNueva={handleNueva}
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
