"use client";

import { useMemo } from "react";
import { useCatalogo } from "@/hooks/useCatalogo";
import { buscarEnCatalogo } from "@/lib/catalogo/search";
import { getVentasPorProductoId } from "@/lib/catalogo/popularidad";
import { CartaMenuSelector } from "@/components/carta/CartaMenuSelector";
import type { ProductoCatalogo, SeccionCatalogo } from "@/types/catalogo";
import type { SeccionPlatos } from "@/types/comanda";

interface ProductosRapidosGridProps {
  seccion: SeccionCatalogo;
  seccionPlatos?: SeccionPlatos;
  alcanceSecciones?: SeccionCatalogo[];
  busqueda?: string;
  onSelect: (producto: ProductoCatalogo) => void;
}

export function ProductosRapidosGrid({
  seccion,
  seccionPlatos,
  alcanceSecciones,
  busqueda = "",
  onSelect,
}: ProductosRapidosGridProps) {
  const { productos } = useCatalogo();
  const ventasPorId = useMemo(
    () => getVentasPorProductoId(productos),
    [productos],
  );

  const alcance = useMemo(
    () => alcanceSecciones ?? [seccion],
    [alcanceSecciones, seccion],
  );
  const enBusqueda = busqueda.trim().length > 0;

  const lista = useMemo(() => {
    if (enBusqueda) {
      return buscarEnCatalogo(productos, busqueda, {
        secciones: alcance,
        soloActivos: true,
      });
    }

    return buscarEnCatalogo(productos, "", {
      secciones: [seccion],
      soloActivos: true,
    });
  }, [productos, busqueda, enBusqueda, alcance, seccion]);

  if (enBusqueda && lista.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-background px-3 py-6 text-center text-sm text-muted">
        Sin resultados para «{busqueda}». Prueba nombre corto, ingrediente o
        «sin gluten».
      </p>
    );
  }

  return (
    <CartaMenuSelector
      seccion={seccion}
      seccionPlatos={seccionPlatos}
      productos={lista}
      ventasPorId={ventasPorId}
      modoBusqueda={enBusqueda}
      onSelect={onSelect}
    />
  );
}
