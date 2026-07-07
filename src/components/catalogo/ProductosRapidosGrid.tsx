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
import { productosMenuParaComanda } from "@/lib/menu-dia/menu-platos-comanda";
import { esProductoCafeCatalogo } from "@/data/cafes-catalogo";
import type { ProductoCatalogo, SeccionCatalogo, CategoriaCarta } from "@/types/catalogo";
import type { SeccionPlatos } from "@/types/comanda";

interface ProductosRapidosGridProps {
  seccion: SeccionCatalogo;
  seccionPlatos?: SeccionPlatos;
  alcanceSecciones?: SeccionCatalogo[];
  busqueda?: string;
  origen?: OrigenPlatos;
  categoriaCarta?: CategoriaCarta;
  onSelect: (producto: ProductoCatalogo) => void;
}

export function ProductosRapidosGrid({
  seccion,
  seccionPlatos,
  alcanceSecciones,
  busqueda = "",
  origen,
  categoriaCarta,
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

  const filtrarCategoria = (lista: ProductoCatalogo[]) => {
    if (!categoriaCarta) return lista;
    if (categoriaCarta === "postres") {
      return lista.filter(
        (p) =>
          p.categoriaCarta === "postres" ||
          (p.seccion === "postres" && !esProductoCafeCatalogo(p)),
      );
    }
    return lista.filter((p) => p.categoriaCarta === categoriaCarta);
  };

  const lista = useMemo(() => {
    if (enBusqueda) {
      const alcance = alcanceSecciones ?? [seccion];
      const resultados = filtrarCategoria(
        buscarEnCatalogo(productos, busqueda, {
          secciones: alcance,
          soloActivos: true,
        }),
      );
      if (!origen) return resultados;
      return filtrarProductosComanda(resultados, { uso, origen });
    }

    if (origen) {
      if (origen === "menu") {
        if (!menu?.activo) return [];

        const delMenu = productosMenuParaComanda(
          menu,
          seccionPlatos as "primeros" | "segundos",
        );

        return delMenu;
      }

      const filtrados = filtrarCategoria(
        filtrarProductosComanda(productos, { uso, origen }),
      );

      return filtrados.sort(
        (a, b) =>
          a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"),
      );
    }

    return filtrarCategoria(
      buscarEnCatalogo(productos, "", {
        secciones: [seccion],
        soloActivos: true,
      }),
    );
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
    categoriaCarta,
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
        ? "Sube el PDF del menú en Configuración → Menú del día."
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
