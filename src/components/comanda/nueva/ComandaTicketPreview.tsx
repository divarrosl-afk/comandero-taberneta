"use client";

import { comandaToTexto } from "@/lib/comanda/format-ticket";
import { TICKET_WIDTH_80MM } from "@/lib/comanda/ticket-kitchen";
import { getCodigoMesaComanda } from "@/lib/mesas/resolve-mesa";
import { TicketMesaHeader } from "@/components/ticket/TicketMesaHeader";
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

function ticketBodyLines(texto: string, codigoMesa: string): string[] {
  const lineas = texto.split("\n");
  let start = 0;
  if (lineas[0]?.trim().toUpperCase() === codigoMesa.trim().toUpperCase()) {
    start = 1;
    if (lineas[start] === "") start += 1;
  }
  return lineas.slice(start);
}

interface ComandaTicketPreviewProps {
  comanda: ComandaCocina;
}

export function ComandaTicketPreview({ comanda }: ComandaTicketPreviewProps) {
  const codigoMesa = getCodigoMesaComanda(comanda);
  const texto = comandaToTexto(comanda, { nombreMesa: codigoMesa });
  const lineas = ticketBodyLines(texto, codigoMesa);

  return (
    <div className="mx-auto w-full max-w-none rounded-2xl border-2 border-stone-700 shadow-lg">
      <div className="bg-stone-800 px-3 py-2">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-stone-400">
          Vista previa · Ticket completo (2 copias) · 80 mm
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
        <TicketMesaHeader codigo={codigoMesa} />
        {lineas.map((line, i) => (
          <TicketLine key={`${i}-${line.slice(0, 12)}`} line={line} />
        ))}
      </div>
    </div>
  );
}
