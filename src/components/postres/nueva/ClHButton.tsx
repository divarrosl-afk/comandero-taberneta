"use client";

import { SectionCard } from "@/components/ui/SectionCard";

interface ClHButtonProps {
  active: boolean;
  onToggle: () => void;
}

export function ClHButton({ active, onToggle }: ClHButtonProps) {
  return (
    <SectionCard title="C/L + H">
      <p className="mb-3 text-xs text-muted">
        Botón rápido configurable para vuestra operativa
      </p>
      <button
        type="button"
        onClick={onToggle}
        className={[
          "flex min-h-16 w-full items-center justify-center rounded-2xl border-2 text-xl font-bold transition active:scale-[0.98]",
          active
            ? "border-primary bg-primary text-primary-foreground shadow-md"
            : "border-border bg-card hover:border-primary/40",
        ].join(" ")}
      >
        C/L + H
      </button>
    </SectionCard>
  );
}
