"use client";

import { useMemo } from "react";
import { useCatalogo } from "@/hooks/useCatalogo";
import { buscarEnCatalogo } from "@/lib/catalogo/search";
import { getVentasPorProductoId } from "@/lib/catalogo/popularidad";
import {
  aUsoComanda,
  filtrarProductosComanda,
  type OrigenPlatos,
} from "@/lib/carta/carta-admin";
import { CartaMenuSelector } from "@/components/carta/CartaMenuSelector";
import { useMenuDia } from "@/hooks/useMenuDia";
import { productoEnMenuHoy } from "@/lib/carta/format-producto";
import type { ProductoCatalogo, SeccionCatalogo } from "@/types/catalogo";
import type { SeccionPlatos } from "@/types/comanda";

interface ProductosRapidosGridProps {
  seccion: SeccionCatalogo;
  seccionPlatos?: SeccionPlatos;
  alcanceSecciones?: SeccionCatalogo[];
  busqueda?: string;
  origen?: OrigenPlatos;
  onSelect: (producto: ProductoCatalogo) => void;
}

export function ProductosRapidosGrid({
  seccion,
  seccionPlatos,
  alcanceSecciones,
  busqueda = "",
  origen,
  onSelect,
}: ProductosRapidosGridProps) {
  const { productos } = useCatalogo();
  const { menu } = useMenuDia();
  const ventasPorId = useMemo(
    () => getVentasPorProductoId(productos),
    [productos],
  );

  const uso = aUsoComanda(seccionPlatos ?? seccion);
  const enBusqueda = busqueda.trim().length > 0;

  const lista = useMemo(() => {
    if (enBusqueda) {
      const alcance = alcanceSecciones ?? [seccion];
      const resultados = buscarEnCatalogo(productos, busqueda, {
        secciones: alcance,
        soloActivos: true,
      });
      if (!origen) return resultados;
      return filtrarProductosComanda(resultados, { uso, origen });
    }

    if (origen) {
      if (origen === "menu") {
        if (!menu?.activo) return [];

        const filtrados = filtrarProductosComanda(productos, { uso, origen })
          .filter((p) =>
            productoEnMenuHoy(
              p,
              menu,
              seccionPlatos as "primeros" | "segundos",
            ),
          );

        return filtrados.sort(
          (a, b) =>
            a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"),
        );
      }

      const filtrados = filtrarProductosComanda(productos, { uso, origen });

      return filtrados.sort(
        (a, b) =>
          a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"),
      );
    }

    return buscarEnCatalogo(productos, "", {
      secciones: [seccion],
      soloActivos: true,
    });
  }, [
    productos,
    busqueda,
    enBusqueda,
    alcanceSecciones,
    seccion,
    origen,
    uso,
    menu,
    seccionPlatos,
  ]);

  if (!enBusqueda && origen === "menu" && !menu?.activo) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-background px-3 py-6 text-center text-sm text-muted">
        El menú del día no está activo hoy. Usa{" "}
        <span className="font-semibold text-primary">Carta almuerzo</span> para
        añadir platos.
      </p>
    );
  }

  if (enBusqueda && lista.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-background px-3 py-6 text-center text-sm text-muted">
        Sin resultados para «{busqueda}». Prueba nombre corto, ingrediente o
        «sin gluten».
      </p>
    );
  }

  if (!enBusqueda && origen && lista.length === 0) {
    const mensaje =
      origen === "menu"
        ? "No hay platos de menú configurados para hoy en esta sección."
        : origen === "carta-almuerzo"
          ? "No hay platos de carta almuerzo en esta sección."
          : "No hay platos de carta cenas en esta sección.";
    return (
      <p className="rounded-xl border border-dashed border-border bg-background px-3 py-6 text-center text-sm text-muted">
        {mensaje}
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
      origen={origen}
      onSelect={onSelect}
    />
  );
}
