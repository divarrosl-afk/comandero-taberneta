"use client";

import { comandaToTexto } from "@/lib/comanda/format-ticket";
import { getNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import type { ComandaCocina } from "@/types/comanda";

interface ComandaTicketPreviewProps {
  comanda: ComandaCocina;
}

export function ComandaTicketPreview({ comanda }: ComandaTicketPreviewProps) {
  const texto = comandaToTexto(comanda, {
    nombreMesa: getNombreMesaComanda(comanda),
  });

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-stone-700 shadow-lg">
      <div className="bg-stone-800 px-4 py-2">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-stone-400">
          Vista previa · Ticket cocina/barra
        </p>
      </div>
      <pre className="whitespace-pre-wrap bg-stone-900 p-4 font-mono text-sm leading-relaxed text-stone-100">
        {texto}
      </pre>
    </div>
  );
}
