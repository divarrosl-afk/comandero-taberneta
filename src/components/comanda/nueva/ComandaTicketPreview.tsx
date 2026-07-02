"use client";

import { comandaToTexto } from "@/lib/comanda/format-ticket";
import { TICKET_WIDTH_80MM } from "@/lib/comanda/ticket-kitchen";
import { getNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import type { ComandaCocina } from "@/types/comanda";

const TICKET_PREVIEW_CH = `${TICKET_WIDTH_80MM}ch`;

function isDetailLine(line: string): boolean {
  const t = line.trimStart();
  return t.startsWith("- ") || t.startsWith("+") || t.startsWith("SUPL.");
}

function TicketLine({ line }: { line: string }) {
  if (!line) return <span className="block h-[0.6em]" aria-hidden />;
  const detail = isDetailLine(line);
  return (
    <span
      className={
        detail
          ? "block text-[17px] font-bold leading-[1.35] tracking-tight"
          : "block text-[15px] font-semibold leading-[1.45]"
      }
    >
      {line}
    </span>
  );
}

interface ComandaTicketPreviewProps {
  comanda: ComandaCocina;
}

export function ComandaTicketPreview({ comanda }: ComandaTicketPreviewProps) {
  const texto = comandaToTexto(comanda, {
    nombreMesa: getNombreMesaComanda(comanda),
  });
  const lineas = texto.split("\n");

  return (
    <div className="mx-auto w-full max-w-none rounded-2xl border-2 border-stone-700 shadow-lg">
      <div className="bg-stone-800 px-3 py-2">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-stone-400">
          Vista previa · Ticket cocina/barra · 80 mm
        </p>
      </div>
      <div
        className="mx-auto bg-stone-900 px-1 py-4 font-mono text-stone-100"
        style={{
          width: TICKET_PREVIEW_CH,
          maxWidth: "100%",
          minWidth: "min(100%, 288px)",
        }}
      >
        {lineas.map((line, i) => (
          <TicketLine key={`${i}-${line.slice(0, 12)}`} line={line} />
        ))}
      </div>
    </div>
  );
}
