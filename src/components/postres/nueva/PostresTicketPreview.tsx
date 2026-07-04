"use client";

import type { ComandaPostres } from "@/types/postres";
import { comandaPostresToTexto } from "@/lib/postres/format-ticket";
import { stripTicketMarkers, TICKET_WIDTH_80MM } from "@/lib/comanda/ticket-kitchen";
import { getCodigoMesaComanda } from "@/lib/mesas/resolve-mesa";
import { TicketMesaHeader } from "@/components/ticket/TicketMesaHeader";

const TICKET_PREVIEW_CH = `${TICKET_WIDTH_80MM}ch`;

function ticketBodyLines(texto: string, codigoMesa: string): string[] {
  const lineas = texto.split("\n");
  let start = 0;
  if (lineas[0]?.trim().toUpperCase() === codigoMesa.trim().toUpperCase()) {
    start = 1;
    if (lineas[start] === "") start += 1;
  }
  return lineas.slice(start);
}

interface PostresTicketPreviewProps {
  comanda: ComandaPostres;
}

export function PostresTicketPreview({ comanda }: PostresTicketPreviewProps) {
  const codigoMesa = getCodigoMesaComanda(comanda);
  const texto = stripTicketMarkers(
    comandaPostresToTexto(comanda, { nombreMesa: codigoMesa }),
  );
  const lineas = ticketBodyLines(texto, codigoMesa);

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-stone-700 shadow-lg">
      <div className="bg-stone-800 px-4 py-2">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-stone-400">
          Vista previa · Ticket postres (sin copia cocina)
        </p>
      </div>
      <div
        className="mx-auto whitespace-pre-wrap bg-stone-900 px-1 py-4 font-mono text-sm leading-relaxed text-stone-100"
        style={{
          width: TICKET_PREVIEW_CH,
          maxWidth: "100%",
          minWidth: "min(100%, 288px)",
        }}
      >
        <TicketMesaHeader codigo={codigoMesa} />
        {lineas.join("\n")}
      </div>
    </div>
  );
}
