import { getExtraLabel, getModificacionLabel, getSalsaLabel } from "@/data/comanda-catalogo";
import { CAMARERO_EQUIPO } from "@/lib/comanda/camarero-equipo";
import { generarIdComanda } from "@/lib/comandas/comandas-service";
import { getMesaCodigo } from "@/lib/mesas/resolve-mesa";
import { tipoSeleccionToPlatoFields } from "@/lib/comanda/tipo-plato";
import { platoTieneContenido } from "@/lib/comanda/plato-factory";
import { postreTieneContenido } from "@/lib/postres/postre-factory";
import { generarIdPostres } from "@/lib/postres/postres-service";
import type { ComandaPostres } from "@/types/postres";
import type {
  ComandaCocina,
  ComandaFormState,
  ExtraMesaId,
  PlatoComanda,
  PlatoFormItem,
  SalsaId,
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
      nombre: s.nombre || getSalsaLabel(s.id as SalsaId),
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
    (t) => t === "menu" || t === "menu_medio" || t === "menu_suplemento",
  );
  const tieneCarta = tipos.some((t) => t.startsWith("carta"));

  if (tieneMenu && tieneCarta) return "mixto";
  if (tieneMenu) return "menu";
  if (tieneCarta) return "carta";
  return "mixto";
}

function mapPostresItems(items: ComandaFormState["postres"]) {
  return items
    .filter(postreTieneContenido)
    .map((p) => ({
      id: p.id,
      nombre: p.nombre.trim(),
      cantidad: p.cantidad,
      nota: p.nota?.trim() || undefined,
    }));
}

export function formTienePlatos(form: ComandaFormState): boolean {
  return [...form.entrantes, ...form.primeros, ...form.segundos, ...form.bebidas].some(
    platoTieneContenido,
  );
}

export function formTieneExtras(form: ComandaFormState): boolean {
  return form.extras.some((e) => e.cantidad > 0);
}

export function formTieneObservaciones(form: ComandaFormState): boolean {
  return form.observaciones.some((o) => o.trim().length > 0);
}

export function formTienePostresOCafes(form: ComandaFormState): boolean {
  return (
    form.postres.some(postreTieneContenido) ||
    form.cafes.some(postreTieneContenido) ||
    form.estadoXCafe !== null
  );
}

/** Cocina: platos, extras u observaciones (sin postres/cafés). */
export function formTieneContenidoCocina(form: ComandaFormState): boolean {
  return (
    formTienePlatos(form) ||
    formTieneExtras(form) ||
    formTieneObservaciones(form)
  );
}

export function formTieneContenido(form: ComandaFormState): boolean {
  return formTieneContenidoCocina(form) || formTienePostresOCafes(form);
}

export function formEsValido(form: ComandaFormState): boolean {
  return form.mesa !== null && formTieneContenido(form);
}

export function formToComanda(form: ComandaFormState): ComandaCocina | null {
  if (!form.mesa || !formTieneContenidoCocina(form)) return null;

  return {
    id: generarIdComanda(),
    mesa: form.mesa,
    mesaCodigo: getMesaCodigo(form.mesa),
    camarero: CAMARERO_EQUIPO,
    tipoServicio: inferirTipoServicio(form),
    entrantes: form.entrantes.filter(platoTieneContenido).map(mapPlatoBase),
    primeros: form.primeros.filter(platoTieneContenido).map(mapPlatoConTipo),
    segundos: form.segundos.filter(platoTieneContenido).map(mapPlatoConTipo),
    bebidas: form.bebidas.filter(platoTieneContenido).map(mapPlatoBase),
    extras: form.extras
      .filter((e) => e.cantidad > 0)
      .map((e) => ({
        nombre: e.nombre || getExtraLabel(e.id as ExtraMesaId),
        cantidad: e.cantidad,
      })),
    observaciones: form.observaciones.map((o) => o.trim()).filter(Boolean),
    creadaEn: new Date().toISOString(),
    enviada: true,
    estadoPanel: "sentados",
  };
}

export function formToComandaPostres(form: ComandaFormState): ComandaPostres | null {
  if (!form.mesa || !formTienePostresOCafes(form)) return null;

  return {
    id: generarIdPostres(),
    mesa: form.mesa,
    mesaCodigo: getMesaCodigo(form.mesa),
    camarero: CAMARERO_EQUIPO,
    postres: mapPostresItems(form.postres),
    cafes: mapPostresItems(form.cafes),
    estadoX: null,
    estadoXCafe: form.estadoXCafe,
    clH: false,
    observaciones: [],
    creadaEn: new Date().toISOString(),
    enviada: true,
    estadoPanel: "sentados",
  };
}
