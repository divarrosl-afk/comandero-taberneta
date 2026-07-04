import type { ProductoCatalogo } from "@/types/catalogo";
import type {
  MenuDiaConfig,
  PlatoMenuDiaImportado,
} from "@/types/menu-dia";
import type { PlatoMenuParseado } from "@/lib/menu-dia/parse-menu-texto";

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

export function importadosDesdeParsed(
  primeros: PlatoMenuParseado[],
  segundos: PlatoMenuParseado[],
): {
  primerosImportados: PlatoMenuDiaImportado[];
  segundosImportados: PlatoMenuDiaImportado[];
} {
  const mapLista = (
    items: PlatoMenuParseado[],
    seccion: "primeros" | "segundos",
  ): PlatoMenuDiaImportado[] =>
    items.map((plato, i) => ({
      id: platoImportadoId(seccion, i, plato.nombre),
      nombre: plato.nombre,
      suplemento: plato.suplemento,
    }));

  return {
    primerosImportados: mapLista(primeros, "primeros"),
    segundosImportados: mapLista(segundos, "segundos"),
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
): ProductoCatalogo[] {
  const importados =
    seccion === "primeros"
      ? menu.primerosImportados
      : menu.segundosImportados;

  if (importados?.length) {
    return importados.map((plato, i) => productoVirtual(plato, seccion, i));
  }

  return [];
}

export function menuTienePlatosImportados(menu: MenuDiaConfig | null): boolean {
  if (!menu) return false;
  return (
    (menu.primerosImportados?.length ?? 0) > 0 ||
    (menu.segundosImportados?.length ?? 0) > 0
  );
}
