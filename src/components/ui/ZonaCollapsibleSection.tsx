"use client";

import { useState, type ReactNode } from "react";
import { labelZona, type ZonaMesa } from "@/types/mesas";

interface ZonaCollapsibleSectionProps {
  zona: ZonaMesa | null;
  titulo?: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function ZonaCollapsibleSection({
  zona,
  titulo,
  count,
  defaultOpen = false,
  children,
}: ZonaCollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const label = titulo ?? (zona ? labelZona(zona) : "Mesa");

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-2 flex w-full items-center justify-between rounded-xl border-2 border-border bg-card px-3 py-2.5 text-left active:scale-[0.99]"
        aria-expanded={open}
      >
        <span className="text-sm font-bold uppercase tracking-wide text-muted">
          {label}
          <span className="ml-2 font-semibold text-foreground">({count})</span>
        </span>
        <span className="text-xs font-bold text-accent" aria-hidden>
          {open ? "Ocultar ▲" : "Ver ▼"}
        </span>
      </button>
      {open && children}
    </section>
  );
}
