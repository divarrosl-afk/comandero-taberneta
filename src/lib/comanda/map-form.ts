import { getCamareroNombre } from "@/data/camareros";
import { getExtraLabel, getModificacionLabel, getSalsaLabel } from "@/data/comanda-catalogo";
import { generarIdComanda } from "@/lib/storage/comandas-local";
import { tipoSeleccionToPlatoFields } from "@/lib/comanda/tipo-plato";
import { platoTieneContenido } from "@/lib/comanda/plato-factory";
import type {
  ComandaCocina,
  ComandaFormState,
  PlatoComanda,
  PlatoFormItem,
  TipoPlatoSeleccion,
  TipoServicio,
} from "@/types/comanda";

function mapPlatoBase(item: PlatoFormItem): Omit<PlatoComanda, "tipo" | "saleComo" | "suplemento"> {
  return {
    id: item.id,
    nombre: item.nombre.trim(),
    cantidad: item.cantidad,
    modificaciones: item.modificaciones.map(getModificacionLabel),
    salsas: item.salsas.map((s) => ({
      nombre: getSalsaLabel(s.id),
      cantidad: s.cantidad,
    })),
    notaLibre: item.notaLibre?.trim() || undefined,
    estado: "pendiente",
  };
}

function mapPlatoConTipo(item: PlatoFormItem): PlatoComanda {
  const base = mapPlatoBase(item);
  if (!item.tipoSeleccion) return base;

  const { tipo, saleComo } = tipoSeleccionToPlatoFields(item.tipoSeleccion);
  return {
    ...base,
    tipo,
    saleComo,
    suplemento:
      item.tipoSeleccion === "menu_suplemento" ? item.suplemento : undefined,
  };
}

function inferirTipoServicio(form: ComandaFormState): TipoServicio {
  const platos = [...form.primeros, ...form.segundos];
  const tipos = platos
    .map((p) => p.tipoSeleccion)
    .filter(Boolean) as TipoPlatoSeleccion[];

  if (tipos.length === 0) return "mixto";

  const tieneMenu = tipos.some(
    (t) => t === "menu" || t === "menu_suplemento",
  );
  const tieneCarta = tipos.some((t) => t.startsWith("carta"));

  if (tieneMenu && tieneCarta) return "mixto";
  if (tieneMenu) return "menu";
  if (tieneCarta) return "carta";
  return "mixto";
}

export function formToComanda(form: ComandaFormState): ComandaCocina | null {
  const camarero = getCamareroNombre(form.camareroId);
  if (!form.mesa || !camarero) return null;

  return {
    id: generarIdComanda(),
    mesa: form.mesa,
    camarero,
    tipoServicio: inferirTipoServicio(form),
    entrantes: form.entrantes.filter(platoTieneContenido).map(mapPlatoBase),
    primeros: form.primeros.filter(platoTieneContenido).map(mapPlatoConTipo),
    segundos: form.segundos.filter(platoTieneContenido).map(mapPlatoConTipo),
    bebidas: form.bebidas.filter(platoTieneContenido).map(mapPlatoBase),
    extras: form.extras
      .filter((e) => e.cantidad > 0)
      .map((e) => ({ nombre: getExtraLabel(e.id), cantidad: e.cantidad })),
    observaciones: form.observaciones.map((o) => o.trim()).filter(Boolean),
    creadaEn: new Date().toISOString(),
    enviada: true,
    estadoPanel: "pendiente",
  };
}

export function formTienePlatos(form: ComandaFormState): boolean {
  return [...form.entrantes, ...form.primeros, ...form.segundos, ...form.bebidas].some(
    platoTieneContenido,
  );
}

export function formEsValido(form: ComandaFormState): boolean {
  return form.mesa !== null && form.camareroId !== null && formTienePlatos(form);
}
