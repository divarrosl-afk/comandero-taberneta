"use client";

import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  active?: boolean;
}

export function SectionCard({
  title,
  actions,
  children,
  active = false,
}: SectionCardProps) {
  return (
    <section
      className={[
        "rounded-2xl border-2 bg-card p-4 shadow-sm transition",
        active ? "border-primary/40" : "border-border",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold uppercase tracking-wide text-foreground">
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
