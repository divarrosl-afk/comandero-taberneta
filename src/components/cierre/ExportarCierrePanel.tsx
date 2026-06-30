"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  descargarExportacionCierre,
  type ExportacionCierre,
  type ResumenExportacion,
} from "@/lib/cierre/exportar";
import { formatearFechaDisplay } from "@/lib/cierre/fecha";

interface ExportarCierrePanelProps {
  onPreparar: () => ExportacionCierre | null;
  onPreview: () => ResumenExportacion | null;
}

export function ExportarCierrePanel({
  onPreparar,
  onPreview,
}: ExportarCierrePanelProps) {
  const [preview, setPreview] = useState<ResumenExportacion | null>(null);
  const [mostrarPreview, setMostrarPreview] = useState(false);

  const handlePreview = () => {
    const res = onPreview();
    setPreview(res);
    setMostrarPreview(true);
  };

  const handleDescargar = () => {
    const datos = onPreparar();
    if (!datos) return;
    descargarExportacionCierre(datos);
    setMostrarPreview(false);
  };

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <h2 className="text-lg font-bold">Exportar JSON del día</h2>
      <p className="text-sm text-muted">
        Incluye comandas, postres, estados, carta, menú del día e impresora.
      </p>

      <Button variant="outline" fullWidth onClick={handlePreview}>
        Vista previa de exportación
      </Button>

      {mostrarPreview && preview && (
        <div className="rounded-xl border-2 border-primary/20 bg-background p-4">
          <p className="mb-3 text-sm font-bold">
            Resumen — {formatearFechaDisplay(preview.fecha)}
          </p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Comandas cocina</dt>
              <dd className="font-semibold">{preview.totalCocina}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Postres</dt>
              <dd className="font-semibold">{preview.totalPostres}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Total tickets</dt>
              <dd className="font-semibold">{preview.totalTickets}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Productos en carta</dt>
              <dd className="font-semibold">{preview.productosCarta}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Menú del día</dt>
              <dd className="font-semibold">
                {preview.menuActivo ? "Activo" : "Inactivo"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Impresora</dt>
              <dd className="font-semibold">{preview.impresoraNombre}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Exportado por</dt>
              <dd className="font-semibold">{preview.exportadoPor}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Tamaño aprox.</dt>
              <dd className="font-semibold">{preview.tamanoAproxKb} KB</dd>
            </div>
          </dl>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setMostrarPreview(false)}
            >
              Cancelar
            </Button>
            <Button fullWidth onClick={handleDescargar}>
              Descargar cierre-taberneta-{preview.fecha}.json
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
