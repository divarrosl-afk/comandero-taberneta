"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PostresTicketPreview } from "@/components/postres/nueva/PostresTicketPreview";
import type { ComandaPostres } from "@/types/postres";

interface PostresEnviadaViewProps {
  comanda: ComandaPostres;
  onNueva: () => void;
}

export function PostresEnviadaView({
  comanda,
  onNueva,
}: PostresEnviadaViewProps) {
  return (
    <>
      <header className="mb-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-green-600">
          Postres enviados
        </p>
        <h1 className="mt-2 text-3xl font-bold text-primary">
          MESA {comanda.mesa}
        </h1>
        <p className="mt-1 text-muted">
          Guardado en este dispositivo · modo local
        </p>
      </header>

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
