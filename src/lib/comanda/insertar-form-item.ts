import { crearPlatoVacio } from "@/lib/comanda/plato-factory";
import { crearPostreVacio } from "@/lib/postres/postre-factory";
import type { PlatoFormItem } from "@/types/comanda";
import type { PostreFormItem } from "@/types/postres";

function nombreVacio(nombre?: string): boolean {
  return !(nombre ?? "").trim();
}

export function insertarPlatoEnLista(
  lista: PlatoFormItem[],
  plato: PlatoFormItem,
): { lista: PlatoFormItem[]; id: string } {
  const vacio = lista.find((p) => nombreVacio(p.nombre));
  if (vacio) {
    return {
      lista: lista.map((p) =>
        p.id === vacio.id ? { ...plato, id: vacio.id } : p,
      ),
      id: vacio.id,
    };
  }
  return { lista: [...lista, plato], id: plato.id };
}

export function insertarPostreEnLista(
  lista: PostreFormItem[],
  datos: Partial<PostreFormItem> & { nombre: string },
): { lista: PostreFormItem[]; id: string } {
  const vacio = lista.find((p) => nombreVacio(p.nombre));
  if (vacio) {
    const item = { ...vacio, ...datos, id: vacio.id };
    return {
      lista: lista.map((p) => (p.id === vacio.id ? item : p)),
      id: vacio.id,
    };
  }
  const item = { ...crearPostreVacio(), ...datos };
  return { lista: [...lista, item], id: item.id };
}

export function idLineaVaciaPlatos(lista: PlatoFormItem[]): string | null {
  const vacio = lista.find((p) => nombreVacio(p.nombre));
  return vacio?.id ?? null;
}

export function idLineaVaciaPostres(lista: PostreFormItem[]): string | null {
  const vacio = lista.find((p) => nombreVacio(p.nombre));
  return vacio?.id ?? null;
}
