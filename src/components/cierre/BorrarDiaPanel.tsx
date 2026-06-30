"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatearFechaDisplay } from "@/lib/cierre/fecha";
import type { ResultadoBorradoDia } from "@/lib/storage/cierre";

interface BorrarDiaPanelProps {
  fecha: string;
  totalCocina: number;
  totalPostres: number;
  onBorrar: () => ResultadoBorradoDia;
}

const CONFIRMACION_TEXTO = "BORRAR";

export function BorrarDiaPanel({
  fecha,
  totalCocina,
  totalPostres,
  onBorrar,
}: BorrarDiaPanelProps) {
  const [paso1, setPaso1] = useState(false);
  const [paso2, setPaso2] = useState(false);
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<ResultadoBorradoDia | null>(null);

  const total = totalCocina + totalPostres;

  const handleConfirmarPaso1 = () => {
    setPaso1(false);
    setPaso2(true);
    setTexto("");
  };

  const handleBorrar = () => {
    if (texto !== CONFIRMACION_TEXTO) return;
    const res = onBorrar();
    setResultado(res);
    setPaso2(false);
    setTexto("");
  };

  return (
    <section className="space-y-3 rounded-2xl border-2 border-red-200 bg-red-50/50 p-4">
      <h2 className="text-lg font-bold text-red-900">Borrar datos del día</h2>
      <p className="text-sm text-red-800">
        Elimina solo las comandas y postres del{" "}
        <strong>{formatearFechaDisplay(fecha)}</strong>. No afecta carta, menú
        ni impresora.
      </p>
      <p className="text-sm font-semibold text-red-900">
        {total} ticket(s) en este día ({totalCocina} cocina, {totalPostres}{" "}
        postres)
      </p>

      <Button
        variant="danger"
        fullWidth
        disabled={total === 0}
        onClick={() => setPaso1(true)}
      >
        Borrar datos del día
      </Button>

      {resultado && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-800">
          Eliminados: {resultado.cocinaEliminadas} cocina,{" "}
          {resultado.postresEliminados} postres.
        </p>
      )}

      <ConfirmDialog
        open={paso1}
        title="¿Seguro que quieres borrar los datos del día?"
        message={`Se eliminarán ${total} ticket(s) del ${formatearFechaDisplay(fecha)}. Esta acción no se puede deshacer.`}
        confirmLabel="Continuar"
        onConfirm={handleConfirmarPaso1}
        onCancel={() => setPaso1(false)}
      />

      {paso2 && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl">
            <h3 className="text-lg font-bold text-red-800">
              Confirmación final
            </h3>
            <p className="mt-2 text-sm text-muted">
              Escribe <strong>{CONFIRMACION_TEXTO}</strong> para confirmar el
              borrado del {formatearFechaDisplay(fecha)}.
            </p>
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value.toUpperCase())}
              placeholder={CONFIRMACION_TEXTO}
              className="mt-4 min-h-12 w-full rounded-xl border-2 border-red-200 bg-background px-3 text-center font-bold uppercase outline-none focus:border-red-400"
              autoComplete="off"
            />
            <div className="mt-5 flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setPaso2(false);
                  setTexto("");
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                fullWidth
                disabled={texto !== CONFIRMACION_TEXTO}
                onClick={handleBorrar}
              >
                Borrar definitivamente
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
