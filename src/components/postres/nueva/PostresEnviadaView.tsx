"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PrintStatusBanner } from "@/components/impresion/PrintStatusBanner";
import { PostresTicketPreview } from "@/components/postres/nueva/PostresTicketPreview";
import { imprimirComandaPostres } from "@/modules/impresion-wifi";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi";
import { getNombreMesa } from "@/lib/storage/mesas";
import { usesRemoteData } from "@/lib/data/backend";
import type { ComandaPostres } from "@/types/postres";

interface PostresEnviadaViewProps {
  comanda: ComandaPostres;
  onNueva: () => void;
  syncAviso?: string | null;
}

export function PostresEnviadaView({
  comanda,
  onNueva,
  syncAviso,
}: PostresEnviadaViewProps) {
  const [printSummary, setPrintSummary] = useState<string | null>(null);
  const [printLoading, setPrintLoading] = useState(true);
  const [printError, setPrintError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setPrintLoading(true);
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
  }, [comanda]);

  return (
    <>
      <header className="mb-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-green-600">
          {PRINT_MESSAGES.enviada}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-primary">
          MESA {getNombreMesa(String(comanda.mesa))}
        </h1>
        <p className="mt-1 text-muted">
          {syncAviso
            ? syncAviso
            : usesRemoteData()
              ? "Sincronizada con el restaurante"
              : "Guardado en este dispositivo · modo local"}
        </p>
      </header>

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
