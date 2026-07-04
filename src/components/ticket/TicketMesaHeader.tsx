interface TicketMesaHeaderProps {
  codigo: string;
}

/** ~2× la altura visual de una cabecera ENTRANTES en el preview del ticket. */
export function TicketMesaHeader({ codigo }: TicketMesaHeaderProps) {
  return (
    <p
      className="py-1 pr-1 text-right text-[4rem] font-black leading-none tracking-tight"
      aria-label={`Mesa ${codigo}`}
    >
      {codigo}
    </p>
  );
}
