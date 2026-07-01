"use client";

import type { ComandaPostres } from "@/types/postres";
import { comandaPostresToTexto } from "@/lib/postres/format-ticket";

interface PostresTicketPreviewProps {
  comanda: ComandaPostres;
}

export function PostresTicketPreview({ comanda }: PostresTicketPreviewProps) {
  const texto = comandaPostresToTexto(comanda);

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-stone-700 shadow-lg">
      <div className="bg-stone-800 px-4 py-2">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-stone-400">
          Vista previa · Ticket postres (sin copia cocina)
        </p>
      </div>
      <pre className="whitespace-pre-wrap bg-stone-900 p-4 font-mono text-sm leading-relaxed text-stone-100">
        {texto}
      </pre>
    </div>
  );
}
