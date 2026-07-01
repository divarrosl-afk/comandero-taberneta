"use client";

import type { ComandaCocina } from "@/types/comanda";
import { comandaToTexto } from "@/lib/comanda/format";

interface ComandaPreviewProps {
  comanda: ComandaCocina;
}

export function ComandaPreview({ comanda }: ComandaPreviewProps) {
  const texto = comandaToTexto(comanda);

  return (
    <section className="rounded-2xl border-2 border-primary/20 bg-card p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Vista previa</h2>
      <pre className="whitespace-pre-wrap rounded-xl bg-stone-900 p-4 font-mono text-sm leading-relaxed text-stone-100">
        {texto}
      </pre>
    </section>
  );
}
