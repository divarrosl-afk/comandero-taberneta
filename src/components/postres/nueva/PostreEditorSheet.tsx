"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ComandaEditorSheet } from "@/components/comanda/nueva/ComandaEditorSheet";
import {
  claveSesionPostreEditor,
  postreBaseEditor,
} from "@/lib/comanda/editor-sheet-session";
import type { PostreFormItem } from "@/types/postres";

interface PostreEditorSheetProps {
  open: boolean;
  titulo: string;
  postre: PostreFormItem;
  nombrePlaceholder?: string;
  notaPlaceholder?: string;
  onClose: () => void;
  onAceptar: (cambios: Partial<PostreFormItem>) => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
}

export function PostreEditorSheet({
  open,
  titulo,
  postre,
  nombrePlaceholder = "Nombre",
  notaPlaceholder = "Nota opcional",
  onClose,
  onAceptar,
  onRemove,
  onDuplicate,
}: PostreEditorSheetProps) {
  const sesionRef = useRef<string | null>(null);
  const [nombre, setNombre] = useState(postre.nombre);
  const [cantidad, setCantidad] = useState(postre.cantidad);
  const [nota, setNota] = useState(postre.nota ?? "");

  const sessionKey = claveSesionPostreEditor(postre.id);

  useEffect(() => {
    if (!open) {
      sesionRef.current = null;
      return;
    }
    if (!sessionKey || sesionRef.current === sessionKey) return;

    sesionRef.current = sessionKey;
    const base = postreBaseEditor(postre);
    setNombre(base.nombre);
    setCantidad(base.cantidad);
    setNota(base.nota ?? "");
  }, [open, sessionKey, postre]);

  const aceptar = () => {
    onAceptar({
      nombre: nombre.trim(),
      cantidad,
      nota: nota.trim() || undefined,
    });
    onClose();
  };

  return (
    <ComandaEditorSheet
      open={open}
      title={titulo}
      subtitle="Ajusta cantidad o nota · luego Aceptar"
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

      <input
        type="text"
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        placeholder={notaPlaceholder}
        className="min-h-11 w-full rounded-xl border-2 border-border bg-background px-3 text-sm outline-none focus:border-primary"
      />

      {(onDuplicate || onRemove) && (
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
