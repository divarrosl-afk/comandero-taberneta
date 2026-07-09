import { getExtraLabel, getModificacionTicketLabel, getSalsaLabel } from "@/data/comanda-catalogo";
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
    modificaciones: item.modificaciones.flatMap((m) => {
      const label = getModificacionTicketLabel(m.id);
      if (m.cantidad <= 1) return [label];
      return [`${label} x${m.cantidad}`];
    }),
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

function mapCafesComoBebidas(items: ComandaFormState["cafes"]): PlatoComanda[] {
  return items.filter(postreTieneContenido).map((c) => ({
    id: c.id,
    nombre: c.nombre.trim(),
    cantidad: c.cantidad,
    modificaciones: [],
    salsas: [],
    notaLibre: c.nota?.trim() || undefined,
    estado: "pendiente" as const,
  }));
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

/** Ticket completo de nueva comanda: cocina + postres + cafés (barra). */
export function formToComanda(form: ComandaFormState): ComandaCocina | null {
  if (!form.mesa || !formTieneContenido(form)) return null;

  const postres = mapPostresItems(form.postres);
  const cafes = mapCafesComoBebidas(form.cafes);
  const bebidas = [
    ...form.bebidas.filter(platoTieneContenido).map(mapPlatoBase),
    ...cafes,
  ];

  return {
    id: generarIdComanda(),
    mesa: form.mesa,
    mesaCodigo: getMesaCodigo(form.mesa),
    camarero: CAMARERO_EQUIPO,
    tipoServicio: inferirTipoServicio(form),
    entrantes: form.entrantes.filter(platoTieneContenido).map(mapPlatoBase),
    primeros: form.primeros.filter(platoTieneContenido).map(mapPlatoConTipo),
    segundos: form.segundos.filter(platoTieneContenido).map(mapPlatoConTipo),
    bebidas,
    postres: postres.length > 0 ? postres : undefined,
    estadoXCafe: form.estadoXCafe,
    extras: form.extras
      .filter((e) => e.cantidad > 0)
      .map((e) => ({
        nombre: e.nombre || getExtraLabel(e.id as ExtraMesaId),
        cantidad: e.cantidad,
      })),
    observaciones: form.observaciones.map((o) => o.trim()).filter(Boolean),
    comensales: form.comensales && form.comensales > 0 ? form.comensales : undefined,
    creadaEn: new Date().toISOString(),
    enviada: true,
    estadoPanel: "sentados",
  };
}

/** Cocina/barra en panel — sin postres ni cafés (van al panel postres). */
export function formToComandaPanel(form: ComandaFormState): ComandaCocina | null {
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
    comensales: form.comensales && form.comensales > 0 ? form.comensales : undefined,
    creadaEn: new Date().toISOString(),
    enviada: true,
    estadoPanel: "sentados",
  };
}

/** Solo comandero postres: ticket independiente de postres y cafés. */
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
