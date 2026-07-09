"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ComandaEditorSheet } from "@/components/comanda/nueva/ComandaEditorSheet";
import { ModificacionesChips } from "@/components/comanda/nueva/ModificacionesChips";
import { SalsasSelector } from "@/components/comanda/nueva/SalsasSelector";
import { TipoPlatoBar } from "@/components/comanda/nueva/TipoPlatoBar";
import {
  setModificacionCantidadEnLista,
  tapModificacionEnLista,
} from "@/lib/comanda/modificaciones";
import {
  claveSesionPlatoEditor,
  platoBaseEditor,
} from "@/lib/comanda/editor-sheet-session";
import { crearPlatoVacio } from "@/lib/comanda/plato-factory";
import { useMenuDia } from "@/hooks/useMenuDia";
import { nombreBoton, type ProductoCatalogo } from "@/types/catalogo";
import type {
  ModificacionId,
  PlatoFormItem,
  SalsaCantidad,
  SeccionPlatos,
} from "@/types/comanda";

interface PlatoEditorSheetProps {
  open: boolean;
  modo: "nuevo" | "editar";
  producto?: ProductoCatalogo;
  plato?: PlatoFormItem;
  seccion: SeccionPlatos;
  conTipo?: boolean;
  nombrePlaceholder?: string;
  onClose: () => void;
  onAceptarNuevo: (plato: PlatoFormItem) => void;
  onAceptarEditar: (cambios: Partial<PlatoFormItem>) => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
}

export function PlatoEditorSheet({
  open,
  modo,
  producto,
  plato,
  seccion,
  conTipo = false,
  nombrePlaceholder = "Nombre del plato",
  onClose,
  onAceptarNuevo,
  onAceptarEditar,
  onRemove,
  onDuplicate,
}: PlatoEditorSheetProps) {
  const { menu } = useMenuDia();
  const baseRef = useRef<PlatoFormItem>(crearPlatoVacio());
  const sesionRef = useRef<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [tipoSeleccion, setTipoSeleccion] = useState<PlatoFormItem["tipoSeleccion"]>();
  const [suplemento, setSuplemento] = useState<PlatoFormItem["suplemento"]>();
  const [modificaciones, setModificaciones] = useState<PlatoFormItem["modificaciones"]>([]);
  const [salsas, setSalsas] = useState<SalsaCantidad[]>([]);
  const [notaLibre, setNotaLibre] = useState("");

  const sessionKey = claveSesionPlatoEditor(modo, producto?.id, plato?.id);

  useEffect(() => {
    if (!open) {
      sesionRef.current = null;
      return;
    }
    if (!sessionKey || sesionRef.current === sessionKey) return;

    sesionRef.current = sessionKey;
    const base = platoBaseEditor(modo, { producto, plato, seccion, menu });
    baseRef.current = base;

    setNombre(base.nombre);
    setCantidad(base.cantidad);
    setTipoSeleccion(base.tipoSeleccion);
    setSuplemento(base.suplemento);
    setModificaciones(base.modificaciones);
    setSalsas(base.salsas);
    setNotaLibre(base.notaLibre ?? "");
  }, [open, sessionKey, modo, producto, plato, seccion, menu]);

  const titulo =
    modo === "nuevo" && producto
      ? nombreBoton(producto)
      : (nombre.trim() || nombrePlaceholder);

  const esBebida = seccion === "bebidas";

  const tapModificacion = (mod: ModificacionId) => {
    setModificaciones((prev) => tapModificacionEnLista(prev, mod));
  };

  const setModificacionCantidad = (mod: ModificacionId, qty: number) => {
    setModificaciones((prev) => setModificacionCantidadEnLista(prev, mod, qty));
  };

  const cycleSalsa = (salsaId: string, salsaNombre: string) => {
    setSalsas((prev) => {
      const existente = prev.find((s) => s.id === salsaId);
      if (!existente) {
        return [...prev, { id: salsaId, nombre: salsaNombre, cantidad: 1 }];
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

  const construirPlato = (): PlatoFormItem => ({
    ...baseRef.current,
    nombre: nombre.trim(),
    cantidad,
    tipoSeleccion,
    suplemento,
    modificaciones,
    salsas,
    notaLibre: notaLibre.trim() || undefined,
  });

  const aceptar = () => {
    const datos = construirPlato();
    if (modo === "nuevo") {
      onAceptarNuevo(datos);
    } else {
      onAceptarEditar({
        nombre: datos.nombre,
        cantidad: datos.cantidad,
        tipoSeleccion: datos.tipoSeleccion,
        suplemento: datos.suplemento,
        modificaciones: datos.modificaciones,
        salsas: datos.salsas,
        notaLibre: datos.notaLibre,
      });
    }
    onClose();
  };

  return (
    <ComandaEditorSheet
      open={open}
      title={titulo}
      subtitle="Modifica cantidad, tipo y extras · luego Aceptar"
      onClose={onClose}
      onAceptar={aceptar}
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder={nombrePlaceholder}
          className="min-h-14 flex-1 rounded-xl border-2 border-border bg-background px-3 text-lg font-medium outline-none focus:border-primary"
          autoComplete="off"
        />
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
            onTap={tapModificacion}
            onSetCantidad={setModificacionCantidad}
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

      {modo === "editar" && (onDuplicate || onRemove) && (
        <div className="flex gap-2">
          {onDuplicate && (
            <Button variant="outline" size="sm" fullWidth onClick={onDuplicate}>
              Duplicar
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={onRemove}
              className="text-red-600"
            >
              Eliminar
            </Button>
          )}
        </div>
      )}
    </ComandaEditorSheet>
  );
}
