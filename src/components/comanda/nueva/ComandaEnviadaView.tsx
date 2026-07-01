"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ComandaTicketPreview } from "@/components/comanda/nueva/ComandaTicketPreview";
import type { ComandaCocina } from "@/types/comanda";

interface ComandaEnviadaViewProps {
  comanda: ComandaCocina;
  onNueva: () => void;
}

export function ComandaEnviadaView({
  comanda,
  onNueva,
}: ComandaEnviadaViewProps) {
  return (
    <>
      <header className="mb-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-green-600">
          Comanda enviada
        </p>
        <h1 className="mt-2 text-3xl font-bold text-primary">
          MESA {comanda.mesa}
        </h1>
        <p className="mt-1 text-muted">
          Guardada en este dispositivo · modo local
        </p>
      </header>

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
