interface TicketMesaHeaderProps {
  codigo: string;
}

export function TicketMesaHeader({ codigo }: TicketMesaHeaderProps) {
  return (
    <p
      className="py-1 text-center text-[2.75rem] font-black leading-none tracking-tight"
      aria-label={`Mesa ${codigo}`}
    >
      {codigo}
    </p>
  );
}
