"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  estiloMesaOperativa,
  labelMesaOperativa,
  type MesaOperativa,
} from "@/types/mesas";
import { contadorTicketsMesaVisible } from "@/lib/mesas/estado-mesa";

interface MesaCardProps {
  mesa: MesaOperativa;
  operativaRevision: number;
  onToggleCobrando: () => void;
  onLiberar: () => void | Promise<void>;
}

const ACCESOS_MESA = [
  {
    id: "mes",
    label: "MES",
    href: "/mesas",
    className: "bg-stone-600 hover:bg-stone-700",
  },
  {
    id: "nota",
    label: "NOTA",
    mesaParam: "comanda/nueva",
    className: "bg-primary hover:bg-primary/90",
  },
  {
    id: "post",
    label: "POST",
    mesaParam: "postres/nuevo",
    className: "bg-violet-600 hover:bg-violet-700",
  },
  {
    id: "pc",
    label: "PC",
    mesaParam: "panel",
    className: "bg-accent hover:bg-accent/90",
  },
] as const;

function MesaAccesoDirecto({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex min-h-11 items-center justify-center rounded-lg text-xs font-extrabold tracking-wide text-white shadow-sm transition active:scale-95",
        className,
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function MesaCard({
  mesa,
  operativaRevision,
  onToggleCobrando,
  onLiberar,
}: MesaCardProps) {
  const [expandido, setExpandido] = useState(false);
  void operativaRevision;
  const ticketsVisibles = contadorTicketsMesaVisible(mesa.id, mesa.estadoPanel);

  const hrefConMesa = (ruta: string) =>
    `/${ruta}?mesa=${encodeURIComponent(mesa.id)}`;

  return (
    <article
      className={[
        "rounded-xl border-2 bg-card p-3 transition",
        estiloMesaOperativa(mesa),
      ].join(" ")}
    >
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 text-left"
        >
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold leading-tight">{mesa.nombreVisible}</p>
            {ticketsVisibles > 0 && (
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-bold">
                {ticketsVisibles}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold opacity-90">
            {labelMesaOperativa(mesa)}
          </p>
        </button>

        <div className="grid w-[8.25rem] shrink-0 grid-cols-2 gap-1.5 sm:w-[9rem]">
          {ACCESOS_MESA.map((acceso) => (
            <MesaAccesoDirecto
              key={acceso.id}
              href={
                "href" in acceso
                  ? acceso.href
                  : hrefConMesa(acceso.mesaParam)
              }
              label={acceso.label}
              className={acceso.className}
            />
          ))}
        </div>
      </div>

      {expandido && (
        <div className="mt-3 space-y-2 border-t border-black/10 pt-3">
          <div className="flex gap-2">
            <Button
              variant={mesa.estado === "cobrando" ? "primary" : "outline"}
              size="sm"
              fullWidth
              onClick={onToggleCobrando}
            >
              {mesa.estado === "cobrando" ? "✓ Cobrando" : "Cobrando"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => {
                void Promise.resolve(onLiberar());
              }}
            >
              Mesa libre
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
