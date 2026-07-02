import type { ProductoCatalogo } from "@/types/catalogo";
import type {
  MenuDiaConfig,
  PlatoMenuDiaImportado,
} from "@/types/menu-dia";
import type { MenuDiaMatchResult } from "@/lib/menu-dia/match-catalogo";

function slugNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
}

export function platoImportadoId(
  seccion: "primeros" | "segundos",
  indice: number,
  nombre: string,
): string {
  return `menu-imp-${seccion}-${indice}-${slugNombre(nombre)}`;
}

export function importadosDesdeMatch(result: MenuDiaMatchResult): {
  primerosImportados: PlatoMenuDiaImportado[];
  segundosImportados: PlatoMenuDiaImportado[];
} {
  const mapLista = (
    items: MenuDiaMatchResult["primeros"],
    seccion: "primeros" | "segundos",
  ): PlatoMenuDiaImportado[] =>
    items.map((m, i) => ({
      id: m.productoId ?? platoImportadoId(seccion, i, m.parseado.nombre),
      nombre: m.parseado.nombre,
      suplemento: m.parseado.suplemento,
      productoId: m.productoId,
    }));

  return {
    primerosImportados: mapLista(result.primeros, "primeros"),
    segundosImportados: mapLista(result.segundos, "segundos"),
  };
}

function productoVirtual(
  plato: PlatoMenuDiaImportado,
  seccion: "primeros" | "segundos",
  orden: number,
): ProductoCatalogo {
  return {
    id: plato.id,
    nombre: plato.nombre,
    seccion,
    tipo: "menu-dia",
    usosComanda: [seccion],
    suplemento: plato.suplemento,
    activo: true,
    agotado: false,
    favorito: false,
    recomendado: false,
    orden,
    ingredientes: [],
    alergenos: [],
  };
}

/** Productos que se muestran en comanda al elegir origen Menú. */
export function productosMenuParaComanda(
  menu: MenuDiaConfig,
  seccion: "primeros" | "segundos",
  catalogo: ProductoCatalogo[],
): ProductoCatalogo[] {
  const importados =
    seccion === "primeros"
      ? menu.primerosImportados
      : menu.segundosImportados;

  if (importados?.length) {
    return importados.map((plato, i) => {
      if (plato.productoId) {
        const cat = catalogo.find((p) => p.id === plato.productoId);
        if (cat) {
          return {
            ...cat,
            nombre: plato.nombre,
            suplemento: plato.suplemento ?? cat.suplemento,
          };
        }
      }
      return productoVirtual(plato, seccion, i);
    });
  }

  const ids = seccion === "primeros" ? menu.primerosIds : menu.segundosIds;
  return ids
    .map((id) => catalogo.find((p) => p.id === id))
    .filter((p): p is ProductoCatalogo => Boolean(p));
}

export function menuTienePlatosImportados(menu: MenuDiaConfig | null): boolean {
  if (!menu) return false;
  return (
    (menu.primerosImportados?.length ?? 0) > 0 ||
    (menu.segundosImportados?.length ?? 0) > 0
  );
}
