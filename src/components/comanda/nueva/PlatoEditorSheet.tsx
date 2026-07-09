"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ComandaEditorSheet } from "@/components/comanda/nueva/ComandaEditorSheet";
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

function platoDesdeProducto(
  producto: ProductoCatalogo,
  seccion: SeccionPlatos,
  menu: ReturnType<typeof useMenuDia>["menu"],
): PlatoFormItem {
  const base = platoFieldsFromProducto(producto, { seccion, menu });
  return {
    ...crearPlatoVacio(),
    ...base,
    nombre: producto.nombre,
  };
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
  const origen = useMemo(() => {
    if (modo === "nuevo" && producto) {
      return platoDesdeProducto(producto, seccion, menu);
    }
    if (plato) return { ...plato };
    return crearPlatoVacio();
  }, [modo, producto, plato, seccion, menu]);

  const [nombre, setNombre] = useState(origen.nombre);
  const [cantidad, setCantidad] = useState(origen.cantidad);
  const [tipoSeleccion, setTipoSeleccion] = useState(origen.tipoSeleccion);
  const [suplemento, setSuplemento] = useState(origen.suplemento);
  const [modificaciones, setModificaciones] = useState(origen.modificaciones);
  const [salsas, setSalsas] = useState<SalsaCantidad[]>(origen.salsas);
  const [notaLibre, setNotaLibre] = useState(origen.notaLibre ?? "");

  useEffect(() => {
    setNombre(origen.nombre);
    setCantidad(origen.cantidad);
    setTipoSeleccion(origen.tipoSeleccion);
    setSuplemento(origen.suplemento);
    setModificaciones(origen.modificaciones);
    setSalsas(origen.salsas);
    setNotaLibre(origen.notaLibre ?? "");
  }, [origen]);

  const titulo =
    modo === "nuevo" && producto
      ? nombreBoton(producto)
      : (nombre.trim() || nombrePlaceholder);

  const esBebida = seccion === "bebidas";

  const tapModificacion = (mod: ModificacionId) => {
    setModificaciones((prev) => {
      const tiene = prev.some((m) => m.id === mod);
      if (tiene) return prev.filter((m) => m.id !== mod);
      return [...prev, { id: mod, cantidad: 1 }];
    });
  };

  const setModificacionCantidad = (mod: ModificacionId, qty: number) => {
    setModificaciones((prev) => {
      const resto = prev.filter((m) => m.id !== mod);
      if (qty <= 0) return resto;
      return [...resto, { id: mod, cantidad: qty }];
    });
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
    ...origen,
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
