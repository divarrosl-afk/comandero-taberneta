"use client";

import { ProductosRapidosGrid } from "@/components/catalogo/ProductosRapidosGrid";
import type { ProductoCatalogo } from "@/types/catalogo";

interface PostresFrecuentesGridProps {
  onSelect: (producto: ProductoCatalogo) => void;
}

export function PostresFrecuentesGrid({ onSelect }: PostresFrecuentesGridProps) {
  return (
    <ProductosRapidosGrid
      seccion="postres"
      titulo="Postres frecuentes"
      onSelect={onSelect}
    />
  );
}
