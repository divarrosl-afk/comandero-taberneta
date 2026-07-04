"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  estiloMesaOperativa,
  labelMesaOperativa,
  type MesaOperativa,
} from "@/types/mesas";
import { getComandasDeMesa } from "@/lib/mesas/estado-mesa";

interface MesaCardProps {
  mesa: MesaOperativa;
  onToggleCobrando: () => void;
  onLiberar: () => void;
}

export function MesaCard({ mesa, onToggleCobrando, onLiberar }: MesaCardProps) {
  const [expandido, setExpandido] = useState(false);
  const { total } = getComandasDeMesa(mesa.id);

  return (
    <article
      className={[
        "rounded-xl border-2 bg-card p-3 transition",
        estiloMesaOperativa(mesa),
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <div>
          <p className="text-lg font-bold">{mesa.nombreVisible}</p>
          <p className="text-xs font-semibold opacity-90">
            {labelMesaOperativa(mesa)}
          </p>
        </div>
        {total > 0 && (
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-bold">
            {total}
          </span>
        )}
      </button>

      {expandido && (
        <div className="mt-3 space-y-2 border-t border-black/10 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/comanda/nueva?mesa=${encodeURIComponent(mesa.id)}`}
              className="flex min-h-11 items-center justify-center rounded-xl bg-primary px-2 text-center text-xs font-bold text-primary-foreground"
            >
              Nueva comanda
            </Link>
            <Link
              href={`/postres/nuevo?mesa=${encodeURIComponent(mesa.id)}`}
              className="flex min-h-11 items-center justify-center rounded-xl border-2 border-border bg-background px-2 text-center text-xs font-bold"
            >
              Postres
            </Link>
          </div>
          <Link
            href={`/panel?mesa=${encodeURIComponent(mesa.id)}`}
            className="flex min-h-10 w-full items-center justify-center rounded-xl border border-border text-xs font-semibold"
          >
            Ver comanda{total > 0 ? ` (${total})` : ""}
          </Link>
          <div className="flex gap-2">
            <Button
              variant={mesa.estado === "cobrando" ? "primary" : "outline"}
              size="sm"
              fullWidth
              onClick={onToggleCobrando}
            >
              {mesa.estado === "cobrando" ? "✓ Cobrando" : "Cobrando"}
            </Button>
            <Button variant="ghost" size="sm" fullWidth onClick={onLiberar}>
              Liberar
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
