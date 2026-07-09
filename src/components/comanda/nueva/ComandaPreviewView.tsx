"use client";

import { Button } from "@/components/ui/Button";
import { BottomBar } from "@/components/ui/BottomBar";
import { ComandaTicketPreview } from "@/components/comanda/nueva/ComandaTicketPreview";
import { PostresTicketPreview } from "@/components/postres/nueva/PostresTicketPreview";
import { getNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";

interface ComandaPreviewViewProps {
  comanda: ComandaCocina | null;
  comandaPostres: ComandaPostres | null;
  onEdit: () => void;
  onSend: () => void;
}

export function ComandaPreviewView({
  comanda,
  comandaPostres,
  onEdit,
  onSend,
}: ComandaPreviewViewProps) {
  const mesaRef = comanda ?? comandaPostres;
  if (!mesaRef) return null;

  return (
    <>
      <header className="mb-4">
        <button
          type="button"
          onClick={onEdit}
          className="mb-2 text-sm font-semibold text-accent"
        >
          ← Volver a editar
        </button>
        <h1 className="text-2xl font-bold text-primary">Revisar comanda</h1>
        <p className="mt-1 text-sm text-muted">
          MESA {getNombreMesaComanda(mesaRef)} · {mesaRef.camarero.toUpperCase()}
        </p>
      </header>

      <div className="space-y-6">
        {comanda && <ComandaTicketPreview comanda={comanda} />}
        {comandaPostres && <PostresTicketPreview comanda={comandaPostres} />}
      </div>

      <BottomBar>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" fullWidth onClick={onEdit}>
            Editar
          </Button>
          <Button size="lg" fullWidth onClick={onSend}>
            Enviar{comanda && comandaPostres ? " todo" : ""}
          </Button>
        </div>
      </BottomBar>
    </>
  );
}
