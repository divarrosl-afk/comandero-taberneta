"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ModificacionesChips } from "@/components/comanda/nueva/ModificacionesChips";
import { SalsasSelector } from "@/components/comanda/nueva/SalsasSelector";
import { TipoPlatoBar } from "@/components/comanda/nueva/TipoPlatoBar";
import { platoFieldsFromProducto } from "@/lib/carta/plato-from-producto";
import { crearPlatoVacio } from "@/lib/comanda/plato-factory";
import { useMenuDia } from "@/hooks/useMenuDia";
import { nombreBoton, type ProductoCatalogo } from "@/types/catalogo";
import type {
  ModificacionId,
  PlatoFormItem,
  SalsaCantidad,
  SeccionPlatos,
} from "@/types/comanda";

interface PlatoRapidoSheetProps {
  producto: ProductoCatalogo;
  seccion: SeccionPlatos;
  conTipo?: boolean;
  onCerrar: () => void;
  onConfirmar: (plato: PlatoFormItem) => void;
}

export function PlatoRapidoSheet({
  producto,
  seccion,
  conTipo = false,
  onCerrar,
  onConfirmar,
}: PlatoRapidoSheetProps) {
  const { menu } = useMenuDia();
  const base = useMemo(
    () =>
      platoFieldsFromProducto(producto, {
        seccion,
        menu,
      }),
    [producto, seccion, menu],
  );

  const [cantidad, setCantidad] = useState(1);
  const [tipoSeleccion, setTipoSeleccion] = useState(
    base.tipoSeleccion,
  );
  const [suplemento, setSuplemento] = useState(base.suplemento);
  const [modificaciones, setModificaciones] = useState<ModificacionId[]>([]);
  const [salsas, setSalsas] = useState<SalsaCantidad[]>([]);
  const [notaLibre, setNotaLibre] = useState("");

  useEffect(() => {
    setCantidad(1);
    setTipoSeleccion(base.tipoSeleccion);
    setSuplemento(base.suplemento);
    setModificaciones([]);
    setSalsas([]);
    setNotaLibre("");
  }, [producto.id, base.tipoSeleccion, base.suplemento]);

  const toggleMod = (mod: ModificacionId) => {
    setModificaciones((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod],
    );
  };

  const cycleSalsa = (salsaId: string, nombre: string) => {
    setSalsas((prev) => {
      const existente = prev.find((s) => s.id === salsaId);
      if (!existente) {
        return [...prev, { id: salsaId, nombre, cantidad: 1 }];
      }
      if (existente.cantidad < 3) {
        return prev.map((s) =>
          s.id === salsaId
            ? { ...s, cantidad: (s.cantidad + 1) as 1 | 2 | 3 }
            : s,
        );
      }
      return prev.filter((s) => s.id !== salsaId);
    });
  };

  const confirmar = () => {
    const plato: PlatoFormItem = {
      ...crearPlatoVacio(),
      ...base,
      nombre: producto.nombre,
      cantidad,
      tipoSeleccion,
      suplemento,
      modificaciones,
      salsas,
      notaLibre: notaLibre.trim() || undefined,
    };
    onConfirmar(plato);
    onCerrar();
  };

  const esBebida = seccion === "bebidas";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-2"
      onClick={onCerrar}
      role="presentation"
    >
      <div
        className="flex max-h-[85dvh] w-full max-w-lg flex-col rounded-2xl border-2 border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="plato-rapido-titulo"
      >
        <div className="shrink-0 border-b border-border px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2
                id="plato-rapido-titulo"
                className="truncate text-lg font-bold text-primary"
              >
                {nombreBoton(producto)}
              </h2>
              <p className="text-xs text-muted">
                Toca modificaciones si hace falta · luego Añadir
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              className="min-h-10 min-w-10 shrink-0 rounded-xl border border-border text-lg font-bold"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">Cantidad</span>
            <QuantityStepper value={cantidad} onChange={setCantidad} />
          </div>

          {conTipo && (
            <TipoPlatoBar
              value={tipoSeleccion}
              suplemento={suplemento}
              onChangeTipo={setTipoSeleccion}
              onChangeSuplemento={setSuplemento}
            />
          )}

          {!esBebida && (
            <>
              <ModificacionesChips
                seleccionadas={modificaciones}
                onToggle={toggleMod}
              />
              <SalsasSelector salsas={salsas} onCycle={cycleSalsa} />
            </>
          )}

          <input
            type="text"
            value={notaLibre}
            onChange={(e) => setNotaLibre(e.target.value)}
            placeholder="Nota libre (opcional)"
            className="min-h-11 w-full rounded-xl border-2 border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="shrink-0 border-t border-border p-3">
          <Button fullWidth size="lg" onClick={confirmar}>
            Añadir a comanda
          </Button>
        </div>
      </div>
    </div>
  );
}
