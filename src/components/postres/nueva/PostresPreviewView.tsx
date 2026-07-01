"use client";

import { Button } from "@/components/ui/Button";
import { BottomBar } from "@/components/ui/BottomBar";
import { PostresTicketPreview } from "@/components/postres/nueva/PostresTicketPreview";
import type { ComandaPostres } from "@/types/postres";

interface PostresPreviewViewProps {
  comanda: ComandaPostres;
  onEdit: () => void;
  onSend: () => void;
}

export function PostresPreviewView({
  comanda,
  onEdit,
  onSend,
}: PostresPreviewViewProps) {
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
        <h1 className="text-2xl font-bold text-primary">Revisar postres</h1>
        <p className="mt-1 text-sm text-muted">
          MESA {comanda.mesa} · {comanda.camarero.toUpperCase()}
        </p>
      </header>

      <PostresTicketPreview comanda={comanda} />

      <BottomBar>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" fullWidth onClick={onEdit}>
            Editar
          </Button>
          <Button size="lg" fullWidth onClick={onSend}>
            Enviar postres
          </Button>
        </div>
      </BottomBar>
    </>
  );
}
