import type {
  ComandaCocina,
  ComandaFormState,
  PlatoComanda,
  PlatoFormItem,
  TipoPlato,
  TipoPlatoSeleccion,
  TipoServicio,
} from "@/types/comanda";
import { getCamareroNombre } from "@/data/camareros";
import { generarIdComanda } from "@/lib/storage/comandas-local";

export function tipoSeleccionToPlatoFields(seleccion: TipoPlatoSeleccion): {
  tipo: TipoPlato;
  saleComo?: "primero" | "segundo";
} {
  switch (seleccion) {
    case "menu":
      return { tipo: "menu" };
    case "menu_suplemento":
      return { tipo: "menu_suplemento" };
    case "carta":
      return { tipo: "carta" };
    case "carta_primero":
      return { tipo: "carta", saleComo: "primero" };
    case "carta_segundo":
      return { tipo: "carta", saleComo: "segundo" };
  }
}

export function etiquetaTipoPlato(plato: PlatoComanda): string {
  const partes: string[] = [];

  if (plato.tipo === "menu") partes.push("MENÚ");
  if (plato.tipo === "menu_suplemento") {
    partes.push("MENÚ");
    if (plato.suplemento) partes.push(`+ SUPLEMENTO +${plato.suplemento}€`);
  }
  if (plato.tipo === "carta") {
    partes.push("CARTA");
    if (plato.saleComo === "primero") partes.push("SALE COMO PRIMERO");
    if (plato.saleComo === "segundo") partes.push("SALE COMO SEGUNDO");
  }

  if (plato.notasCocina) partes.push(plato.notasCocina);

  return partes.join(" · ");
}

function mapPlatoSimple(item: PlatoFormItem): PlatoComanda {
  return {
    id: item.id,
    nombre: item.nombre.trim(),
    cantidad: item.cantidad,
    notasCocina: item.notasCocina?.trim() || undefined,
    estado: "pendiente",
  };
}

function mapPlatoConTipo(item: PlatoFormItem): PlatoComanda {
  const base = mapPlatoSimple(item);
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
    entrantes: form.entrantes
      .filter((p) => p.nombre.trim())
      .map(mapPlatoSimple),
    primeros: form.primeros
      .filter((p) => p.nombre.trim())
      .map(mapPlatoConTipo),
    segundos: form.segundos
      .filter((p) => p.nombre.trim())
      .map(mapPlatoConTipo),
    bebidas: form.bebidas.filter((p) => p.nombre.trim()).map(mapPlatoSimple),
    observaciones: form.observaciones
      .map((o) => o.trim())
      .filter(Boolean),
    creadaEn: new Date().toISOString(),
    enviada: true,
  };
}

function lineaPlato(plato: PlatoComanda): string {
  const cantidad = plato.cantidad > 1 ? ` x${plato.cantidad}` : "";
  const detalle = etiquetaTipoPlato(plato);
  return detalle
    ? `- ${plato.nombre}${cantidad} · ${detalle}`
    : `- ${plato.nombre}${cantidad}`;
}

function lineaPlatoSimple(plato: PlatoComanda): string {
  const cantidad = plato.cantidad > 1 ? ` x${plato.cantidad}` : "";
  const notas = plato.notasCocina ? ` · ${plato.notasCocina}` : "";
  return `- ${plato.nombre}${cantidad}${notas}`;
}

export function comandaToTexto(comanda: ComandaCocina): string {
  const lineas: string[] = [
    `MESA ${comanda.mesa} · CAMARERO ${comanda.camarero.toUpperCase()}`,
    "",
  ];

  if (comanda.entrantes.length) {
    lineas.push("ENTRANTES");
    comanda.entrantes.forEach((p) => lineas.push(lineaPlatoSimple(p)));
    lineas.push("");
  }

  if (comanda.primeros.length) {
    lineas.push("PRIMEROS");
    comanda.primeros.forEach((p) => lineas.push(lineaPlato(p)));
    lineas.push("");
  }

  if (comanda.segundos.length) {
    lineas.push("SEGUNDOS");
    comanda.segundos.forEach((p) => lineas.push(lineaPlato(p)));
    lineas.push("");
  }

  if (comanda.bebidas.length) {
    lineas.push("BEBIDAS");
    comanda.bebidas.forEach((p) => lineas.push(lineaPlatoSimple(p)));
    lineas.push("");
  }

  if (comanda.observaciones.length) {
    lineas.push("OBSERVACIONES");
    comanda.observaciones.forEach((o) => lineas.push(`- ${o}`));
  }

  return lineas.join("\n").trimEnd();
}
