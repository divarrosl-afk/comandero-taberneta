"use client";

import { comandaToTexto } from "@/lib/comanda/format-ticket";
import { TICKET_WIDTH_80MM } from "@/lib/comanda/ticket-kitchen";
import { getNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import type { ComandaCocina } from "@/types/comanda";

/** Ancho visual 80 mm ≈ 48 caracteres monospace a ~8px/char */
const TICKET_PREVIEW_CH = `${TICKET_WIDTH_80MM}ch`;

interface ComandaTicketPreviewProps {
  comanda: ComandaCocina;
}

export function ComandaTicketPreview({ comanda }: ComandaTicketPreviewProps) {
  const texto = comandaToTexto(comanda, {
    nombreMesa: getNombreMesaComanda(comanda),
  });

  return (
    <div className="mx-auto w-full max-w-none rounded-2xl border-2 border-stone-700 shadow-lg">
      <div className="bg-stone-800 px-3 py-2">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-stone-400">
          Vista previa · Ticket cocina/barra · 80 mm
        </p>
      </div>
      <pre
        className="mx-auto whitespace-pre-wrap break-words bg-stone-900 px-2 py-4 font-mono text-[15px] font-semibold leading-[1.45] text-stone-100"
        style={{
          width: TICKET_PREVIEW_CH,
          maxWidth: "100%",
          minWidth: "min(100%, 288px)",
        }}
      >
        {texto}
      </pre>
    </div>
  );
}
