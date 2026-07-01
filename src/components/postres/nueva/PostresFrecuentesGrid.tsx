"use client";

import { ProductosRapidosGrid } from "@/components/catalogo/ProductosRapidosGrid";
import type { ProductoCatalogo } from "@/types/catalogo";

interface PostresFrecuentesGridProps {
  busqueda?: string;
  onSelect: (producto: ProductoCatalogo) => void;
}

export function PostresFrecuentesGrid({
  busqueda = "",
  onSelect,
}: PostresFrecuentesGridProps) {
  return (
    <ProductosRapidosGrid
      seccion="postres"
      alcanceSecciones={["postres"]}
      busqueda={busqueda}
      onSelect={onSelect}
    />
  );
}
