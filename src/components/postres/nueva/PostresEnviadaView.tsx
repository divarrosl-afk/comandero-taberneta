"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PrintStatusBanner } from "@/components/impresion/PrintStatusBanner";
import { PostresTicketPreview } from "@/components/postres/nueva/PostresTicketPreview";
import { imprimirComandaPostres } from "@/modules/impresion-wifi";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi";
import { getNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import { usesRemoteData } from "@/lib/data/backend";
import type { ComandaPostres } from "@/types/postres";

interface PostresEnviadaViewProps {
  comanda: ComandaPostres;
  onNueva: () => void;
  synced: boolean;
  syncAviso?: string | null;
  onReintentarSync?: () => Promise<boolean>;
}

export function PostresEnviadaView({
  comanda,
  onNueva,
  synced,
  syncAviso,
  onReintentarSync,
}: PostresEnviadaViewProps) {
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
        "La comanda no está en el servidor — postres y otros dispositivos no la verán hasta sincronizar.",
      );
      setPrintError(true);
      return;
    }

    (async () => {
      setPrintLoading(true);
      setPrintError(false);
      try {
        const batch = await imprimirComandaPostres(comanda);
        if (!cancelled) {
          setPrintSummary(
            batch.allOk
              ? batch.summary
              : PRINT_MESSAGES.printFailGuardado,
          );
          setPrintError(!batch.allOk);
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
  }, [comanda, puedeImprimir]);

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
                : "Guardado en este dispositivo · modo local"
              : "Solo visible en este móvil hasta confirmar en el servidor"}
        </p>
      </header>

      {usesRemoteData() && !syncedNow && onReintentarSync && (
        <div className="mb-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            Confirma la sincronización con el servidor antes de imprimir.
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

      <PostresTicketPreview comanda={comanda} />

      <div className="mt-6 space-y-3">
        <Button fullWidth size="lg" onClick={onNueva}>
          Nuevo comandero postres
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
