"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { NumericKeypadModal } from "@/components/ui/NumericKeypadModal";
import { SectionCard } from "@/components/ui/SectionCard";
import { EXTRAS_MESA } from "@/data/comanda-catalogo";
import type { ExtraMesaItem } from "@/types/comanda";

interface ExtrasMesaSectionProps {
  extras: ExtraMesaItem[];
  onSetCantidad: (id: string, nombre: string, cantidad: number) => void;
}

interface CalculadoraAbierta {
  id: string;
  nombre: string;
  cantidad: number;
}

export function ExtrasMesaSection({
  extras,
  onSetCantidad,
}: ExtrasMesaSectionProps) {
  const [extraLibre, setExtraLibre] = useState("");
  const [calculadora, setCalculadora] = useState<CalculadoraAbierta | null>(
    null,
  );

  const cantidadDe = (id: string) =>
    extras.find((e) => e.id === id)?.cantidad ?? 0;

  const manejarToque = (id: string, nombre: string) => {
    const actual = cantidadDe(id);
    if (actual >= 3) {
      setCalculadora({ id, nombre, cantidad: actual });
      return;
    }
    onSetCantidad(id, nombre, actual + 1);
  };

  const confirmarCalculadora = (cantidad: number) => {
    if (!calculadora) return;
    onSetCantidad(calculadora.id, calculadora.nombre, cantidad);
    if (calculadora.id.startsWith("extra-libre-")) {
      setExtraLibre("");
    }
    setCalculadora(null);
  };

  const abrirCalculadoraLibre = () => {
    const nombre = extraLibre.trim();
    if (!nombre) return;
    const id = `extra-libre-${nombre.toLowerCase().replace(/\s+/g, "-")}`;
    setCalculadora({
      id,
      nombre,
      cantidad: cantidadDe(id),
    });
  };

  return (
    <>
      <SectionCard title="Extras de mesa">
        <p className="mb-3 text-xs text-muted">
          Toca x1 → x2 → x3 · al 4.º toque, calculadora para cantidades mayores
        </p>
        <div className="flex flex-wrap gap-2">
          {EXTRAS_MESA.map((extra) => {
            const cantidad = cantidadDe(extra.id);
            return (
              <Chip
                key={extra.id}
                label={extra.labelCorto ?? extra.label}
                count={cantidad}
                active={cantidad > 0}
                onClick={() => manejarToque(extra.id, extra.label)}
              />
            );
          })}
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Otro (escribir)
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={extraLibre}
              onChange={(e) => setExtraLibre(e.target.value)}
              placeholder="Ej: Hielo extra, servilletas…"
              className="min-h-12 flex-1 rounded-xl border-2 border-border bg-background px-3 text-sm outline-none focus:border-primary"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={abrirCalculadoraLibre}
              disabled={!extraLibre.trim()}
              className="shrink-0 rounded-xl border-2 border-primary bg-primary/10 px-4 text-sm font-bold text-primary disabled:opacity-40"
            >
              Cant.
            </button>
          </div>
          {extras
            .filter((e) => e.id.startsWith("extra-libre-"))
            .map((e) => (
              <Chip
                key={e.id}
                label={e.nombre}
                count={e.cantidad}
                active
                onClick={() =>
                  setCalculadora({
                    id: e.id,
                    nombre: e.nombre,
                    cantidad: e.cantidad,
                  })
                }
              />
            ))}
        </div>
      </SectionCard>

      <NumericKeypadModal
        open={calculadora !== null}
        titulo={calculadora?.nombre ?? ""}
        valorInicial={calculadora?.cantidad}
        onConfirm={confirmarCalculadora}
        onCancel={() => setCalculadora(null)}
      />
    </>
  );
}
