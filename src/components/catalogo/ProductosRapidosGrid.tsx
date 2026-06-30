"use client";

import { useMemo, useState } from "react";
import { useCatalogo } from "@/hooks/useCatalogo";
import { CartaMenuSelector } from "@/components/carta/CartaMenuSelector";
import type { ProductoCatalogo, SeccionCatalogo } from "@/types/catalogo";
import type { SeccionPlatos } from "@/types/comanda";

interface ProductosRapidosGridProps {
  seccion: SeccionCatalogo;
  seccionPlatos?: SeccionPlatos;
  onSelect: (producto: ProductoCatalogo) => void;
  titulo?: string;
}

export function ProductosRapidosGrid({
  seccion,
  seccionPlatos,
  onSelect,
}: ProductosRapidosGridProps) {
  const { productos } = useCatalogo();

  const lista = useMemo(
    () =>
      productos
        .filter((p) => p.seccion === seccion)
        .sort((a, b) => {
          if (a.orden !== b.orden) return a.orden - b.orden;
          if (a.favorito !== b.favorito) return a.favorito ? -1 : 1;
          return a.nombre.localeCompare(b.nombre, "es");
        }),
    [productos, seccion],
  );

  return (
    <CartaMenuSelector
      seccion={seccion}
      seccionPlatos={seccionPlatos}
      productos={lista}
      onSelect={onSelect}
    />
  );
}
