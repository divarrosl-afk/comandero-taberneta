interface TicketMesaHeaderProps {
  codigo: string;
}

/** Mismo peso visual que una línea de plato en la vista previa del ticket. */
export function TicketMesaHeader({ codigo }: TicketMesaHeaderProps) {
  return (
    <span
      className="block py-0.5 text-left text-[15px] font-semibold leading-[1.45]"
      aria-label={`Mesa ${codigo}`}
    >
      {codigo}
    </span>
  );
}
