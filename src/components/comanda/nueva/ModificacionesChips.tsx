"use client";

import { useState } from "react";
import {
  esModToggle,
  MODIFICACIONES,
} from "@/data/comanda-catalogo";
import { Chip } from "@/components/ui/Chip";
import { NumericKeypadModal } from "@/components/ui/NumericKeypadModal";
import { cantidadModificacion } from "@/lib/comanda/modificaciones";
import type { ModificacionCantidad, ModificacionId } from "@/types/comanda";

interface ModificacionesChipsProps {
  seleccionadas: ModificacionCantidad[];
  onTap: (id: ModificacionId) => void;
  onSetCantidad: (id: ModificacionId, cantidad: number) => void;
}

interface CalculadoraAbierta {
  id: ModificacionId;
  label: string;
  cantidad: number;
}

export function ModificacionesChips({
  seleccionadas,
  onTap,
  onSetCantidad,
}: ModificacionesChipsProps) {
  const [calculadora, setCalculadora] = useState<CalculadoraAbierta | null>(
    null,
  );

  const manejarToque = (id: ModificacionId, label: string) => {
    if (esModToggle(id)) {
      onTap(id);
      return;
    }

    const actual = cantidadModificacion(seleccionadas, id);
    if (actual >= 3) {
      setCalculadora({ id, label, cantidad: actual });
      return;
    }
    onTap(id);
  };

  const confirmarCalculadora = (cantidad: number) => {
    if (!calculadora) return;
    onSetCantidad(calculadora.id, cantidad);
    setCalculadora(null);
  };

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Modificaciones{" "}
          <span className="font-normal normal-case">
            (toca x1 → x2 → x3 · al 4.º toque, calculadora)
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {MODIFICACIONES.map((mod) => {
            const cantidad = cantidadModificacion(seleccionadas, mod.id);
            const activo = esModToggle(mod.id)
              ? cantidad > 0
              : cantidad > 0;
            return (
              <Chip
                key={mod.id}
                label={mod.labelCorto ?? mod.label}
                count={esModToggle(mod.id) ? undefined : cantidad}
                active={activo}
                onClick={() =>
                  manejarToque(mod.id, mod.labelCorto ?? mod.label)
                }
                size="sm"
                variant={
                  mod.id === "urgente" && activo
                    ? "urgent"
                    : mod.id === "urgente"
                      ? "urgent"
                      : "default"
                }
              />
            );
          })}
        </div>
      </div>

      <NumericKeypadModal
        open={calculadora !== null}
        titulo={calculadora?.label ?? ""}
        valorInicial={calculadora?.cantidad}
        onConfirm={confirmarCalculadora}
        onCancel={() => setCalculadora(null)}
      />
    </>
  );
}
