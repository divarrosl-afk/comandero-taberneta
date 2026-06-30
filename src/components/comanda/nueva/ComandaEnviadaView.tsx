"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PrintStatusBanner } from "@/components/impresion/PrintStatusBanner";
import { ComandaTicketPreview } from "@/components/comanda/nueva/ComandaTicketPreview";
import { imprimirComandaCocina } from "@/modules/impresion-wifi";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi";
import { getNombreMesa } from "@/lib/storage/mesas";
import type { ComandaCocina } from "@/types/comanda";

interface ComandaEnviadaViewProps {
  comanda: ComandaCocina;
  onNueva: () => void;
}

export function ComandaEnviadaView({
  comanda,
  onNueva,
}: ComandaEnviadaViewProps) {
  const [printSummary, setPrintSummary] = useState<string | null>(null);
  const [printLoading, setPrintLoading] = useState(true);
  const [printError, setPrintError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setPrintLoading(true);
      try {
        const batch = await imprimirComandaCocina(comanda);
        if (!cancelled) {
          setPrintSummary(batch.summary);
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
          Guardada en este dispositivo · modo local
        </p>
      </header>

      <PrintStatusBanner
        summary={printSummary}
        loading={printLoading}
        error={printError}
      />

      <ComandaTicketPreview comanda={comanda} />

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
