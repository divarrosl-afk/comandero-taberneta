"use client";

import Link from "next/link";
import { BorrarDiaPanel } from "@/components/cierre/BorrarDiaPanel";
import { ExportarCierrePanel } from "@/components/cierre/ExportarCierrePanel";
import { FiltrosCierrePanel } from "@/components/cierre/FiltrosCierrePanel";
import { ListaEntradasCierre } from "@/components/cierre/ListaEntradasCierre";
import { ResumenCierreCard } from "@/components/cierre/ResumenCierreCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useCierre } from "@/hooks/useCierre";
import { formatearFechaDisplay } from "@/lib/cierre/fecha";

export function CierreClient() {
  const { sesion } = useAuth();
  const {
    filtros,
    actualizarFiltros,
    entradasFiltradas,
    resumen,
    camareros,
    mesas,
    conteoDia,
    recargar,
    prepararExportacion,
    previewExportacion,
    borrarDia,
  } = useCierre(sesion);

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-4 pb-8">
      <header className="mb-4">
        <Link
          href="/"
          className="mb-2 inline-block text-sm font-semibold text-accent"
        >
          ← Inicio
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Cierre de servicio
            </h1>
            <p className="mt-1 text-sm text-muted">
              {formatearFechaDisplay(filtros.fecha)} · Solo administrador
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={recargar}>
            Actualizar
          </Button>
        </div>
      </header>

      <div className="space-y-6">
        <FiltrosCierrePanel
          filtros={filtros}
          camareros={camareros}
          mesas={mesas}
          onChange={actualizarFiltros}
        />

        <ResumenCierreCard resumen={resumen} />

        <ListaEntradasCierre entradas={entradasFiltradas} />

        <ExportarCierrePanel
          onPreparar={prepararExportacion}
          onPreview={previewExportacion}
        />

        <BorrarDiaPanel
          fecha={filtros.fecha}
          totalCocina={conteoDia.cocina}
          totalPostres={conteoDia.postres}
          onBorrar={borrarDia}
        />
      </div>
    </main>
  );
}
