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
  producto?: ProductoCatalogo;
  platoInicial?: PlatoFormItem;
  seccion: SeccionPlatos;
  conTipo?: boolean;
  modo?: "añadir" | "editar";
  onCerrar: () => void;
  onConfirmar: (plato: PlatoFormItem) => void;
}

export function PlatoRapidoSheet({
  producto,
  platoInicial,
  seccion,
  conTipo = false,
  modo = "añadir",
  onCerrar,
  onConfirmar,
}: PlatoRapidoSheetProps) {
  const { menu } = useMenuDia();
  const base = useMemo(() => {
    if (producto) {
      return platoFieldsFromProducto(producto, { seccion, menu });
    }
    return {};
  }, [producto, seccion, menu]);

  const titulo =
    producto?.nombre ?? platoInicial?.nombre ?? "Plato";

  const [cantidad, setCantidad] = useState(platoInicial?.cantidad ?? 1);
  const [tipoSeleccion, setTipoSeleccion] = useState(
    platoInicial?.tipoSeleccion ?? base.tipoSeleccion,
  );
  const [suplemento, setSuplemento] = useState(
    platoInicial?.suplemento ?? base.suplemento,
  );
  const [modificaciones, setModificaciones] = useState<ModificacionId[]>(
    platoInicial?.modificaciones ?? [],
  );
  const [salsas, setSalsas] = useState<SalsaCantidad[]>(
    platoInicial?.salsas ?? [],
  );
  const [notaLibre, setNotaLibre] = useState(platoInicial?.notaLibre ?? "");

  const resetKey = producto?.id ?? platoInicial?.id ?? "nuevo";

  useEffect(() => {
    if (modo === "editar" && platoInicial) {
      setCantidad(platoInicial.cantidad);
      setTipoSeleccion(platoInicial.tipoSeleccion ?? base.tipoSeleccion);
      setSuplemento(platoInicial.suplemento ?? base.suplemento);
      setModificaciones(platoInicial.modificaciones);
      setSalsas(platoInicial.salsas);
      setNotaLibre(platoInicial.notaLibre ?? "");
      return;
    }
    setCantidad(1);
    setTipoSeleccion(base.tipoSeleccion);
    setSuplemento(base.suplemento);
    setModificaciones([]);
    setSalsas([]);
    setNotaLibre("");
  }, [resetKey, modo, platoInicial, base.tipoSeleccion, base.suplemento]);

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
    const nombre = producto?.nombre ?? platoInicial?.nombre ?? "";
    const plato: PlatoFormItem = {
      ...(platoInicial ?? crearPlatoVacio()),
      ...base,
      nombre,
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
  const esEditar = modo === "editar";

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
                {producto ? nombreBoton(producto) : titulo}
              </h2>
              <p className="text-xs text-muted">
                {esEditar
                  ? "Edita y guarda los cambios"
                  : "Toca modificaciones si hace falta · luego Añadir"}
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
            {esEditar ? "Guardar cambios" : "Añadir a comanda"}
          </Button>
        </div>
      </div>
    </div>
  );
}
