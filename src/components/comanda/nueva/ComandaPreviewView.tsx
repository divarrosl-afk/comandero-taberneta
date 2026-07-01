"use client";

import { Button } from "@/components/ui/Button";
import { BottomBar } from "@/components/ui/BottomBar";
import { ComandaTicketPreview } from "@/components/comanda/nueva/ComandaTicketPreview";
import type { ComandaCocina } from "@/types/comanda";

interface ComandaPreviewViewProps {
  comanda: ComandaCocina;
  onEdit: () => void;
  onSend: () => void;
}

export function ComandaPreviewView({
  comanda,
  onEdit,
  onSend,
}: ComandaPreviewViewProps) {
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
          MESA {comanda.mesa} · {comanda.camarero.toUpperCase()}
        </p>
      </header>

      <ComandaTicketPreview comanda={comanda} />

      <BottomBar>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" fullWidth onClick={onEdit}>
            Editar
          </Button>
          <Button size="lg" fullWidth onClick={onSend}>
            Enviar comanda
          </Button>
        </div>
      </BottomBar>
    </>
  );
}
