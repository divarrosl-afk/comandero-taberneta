"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PrintStatusBanner } from "@/components/impresion/PrintStatusBanner";
import { ComandaTicketPreview } from "@/components/comanda/nueva/ComandaTicketPreview";
import { imprimirComandaCocina, imprimirComandaPostres } from "@/modules/impresion-wifi";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi";
import { getNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import { usesRemoteData } from "@/lib/data/backend";
import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";
import { PostresTicketPreview } from "@/components/postres/nueva/PostresTicketPreview";

interface ComandaEnviadaViewProps {
  comanda: ComandaCocina;
  comandaPostres?: ComandaPostres | null;
  onNueva: () => void;
  synced: boolean;
  syncAviso?: string | null;
  onReintentarSync?: () => Promise<boolean>;
}

export function ComandaEnviadaView({
  comanda,
  comandaPostres,
  onNueva,
  synced,
  syncAviso,
  onReintentarSync,
}: ComandaEnviadaViewProps) {
  const [printSummary, setPrintSummary] = useState<string | null>(null);
  const [printLoading, setPrintLoading] = useState(true);
  const [printError, setPrintError] = useState(false);
  const [syncedNow, setSyncedNow] = useState(synced);
  const [reintentando, setReintentando] = useState(false);

  useEffect(() => {
    setSyncedNow(synced);
  }, [synced]);

  const puedeImprimir = !usesRemoteData() || syncedNow;

  useEffect(() => {
    let cancelled = false;

    if (!puedeImprimir) {
      setPrintLoading(false);
      setPrintSummary(
        "La comanda no está en el servidor — cocina y otros dispositivos no la verán hasta sincronizar.",
      );
      setPrintError(true);
      return;
    }

    (async () => {
      setPrintLoading(true);
      setPrintError(false);
      try {
        const batch = await imprimirComandaCocina(comanda);
        let summary = batch.allOk ? batch.summary : PRINT_MESSAGES.printFailGuardado;
        let error = !batch.allOk;

        if (comandaPostres && puedeImprimir) {
          const batchPostres = await imprimirComandaPostres(comandaPostres);
          if (!batchPostres.allOk) {
            error = true;
            summary = `${summary} · Postres: ${PRINT_MESSAGES.printFailGuardado}`;
          } else {
            summary = `${summary} · Postres OK`;
          }
        }

        if (!cancelled) {
          setPrintSummary(summary);
          setPrintError(error);
        }
      } catch {
        if (!cancelled) {
          setPrintSummary(PRINT_MESSAGES.error);
          setPrintError(true);
        }
      } finally {
        if (!cancelled) setPrintLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [comanda, comandaPostres, puedeImprimir]);

  const handleReintentar = async () => {
    if (!onReintentarSync) return;
    setReintentando(true);
    try {
      const ok = await onReintentarSync();
      setSyncedNow(ok);
    } finally {
      setReintentando(false);
    }
  };

  return (
    <>
      <header className="mb-6 text-center">
        <p
          className={`text-sm font-bold uppercase tracking-widest ${
            syncedNow ? "text-green-600" : "text-amber-600"
          }`}
        >
          {syncedNow ? PRINT_MESSAGES.enviada : "Pendiente de sincronizar"}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-primary">
          MESA {getNombreMesaComanda(comanda)}
        </h1>
        <p className="mt-1 text-muted">
          {syncAviso
            ? syncAviso
            : syncedNow
              ? usesRemoteData()
                ? "Sincronizada con el restaurante"
                : "Guardada en este dispositivo · modo local"
              : "Solo visible en este móvil hasta confirmar en el servidor"}
        </p>
      </header>

      {usesRemoteData() && !syncedNow && onReintentarSync && (
        <div className="mb-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            En un TPV conectado, la comanda debe guardarse en el servidor antes
            de imprimir y antes de que cocina la vea en el panel.
          </p>
          <Button
            fullWidth
            className="mt-3"
            onClick={() => void handleReintentar()}
            disabled={reintentando}
          >
            {reintentando ? "Sincronizando…" : "Reintentar sincronización"}
          </Button>
        </div>
      )}

      <PrintStatusBanner
        summary={printSummary}
        loading={printLoading}
        error={printError}
      />

      <ComandaTicketPreview comanda={comanda} />

      {comandaPostres && (
        <div className="mt-6">
          <PostresTicketPreview comanda={comandaPostres} />
        </div>
      )}

      <div className="mt-6 space-y-3">
        <Button fullWidth size="lg" onClick={onNueva}>
          Nueva comanda
        </Button>
        <Link href="/" className="block">
          <Button variant="outline" fullWidth size="lg">
            Volver al inicio
          </Button>
        </Link>
      </div>
    </>
  );
}
