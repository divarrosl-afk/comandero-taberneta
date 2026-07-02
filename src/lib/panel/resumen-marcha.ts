import type { ComandaCocina, PlatoComanda } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";
import type { ComandaPostres } from "@/types/postres";

function etiquetaPlato(p: PlatoComanda): string {
  return p.cantidad > 1 ? `${p.nombre} x${p.cantidad}` : p.nombre;
}

/** Líneas mínimas según la fase de marcha actual */
export function lineasMarchaCocina(
  comanda: ComandaCocina,
  estado: EstadoPanel,
  max = 3,
): string[] {
  const bebidas = comanda.bebidas.map(etiquetaPlato);
  const entrantes = comanda.entrantes.map(etiquetaPlato);
  const primeros = comanda.primeros.map(etiquetaPlato);
  const segundos = comanda.segundos.map(etiquetaPlato);

  let fuente: string[] = [];

  switch (estado) {
    case "sentados":
    case "bebidas":
      fuente = bebidas;
      break;
    case "tapas":
    case "marcha_1":
      fuente = entrantes.length ? entrantes : bebidas;
      break;
    case "tiene_primeros":
      fuente = primeros.length ? primeros : entrantes;
      break;
    case "marcha_segundos":
    case "segundos":
      fuente = segundos.length ? segundos : primeros;
      break;
    case "marcha_postres":
    case "tiene_postres":
    case "marcha_cafes":
    case "tiene_cafes":
      fuente = comanda.observaciones;
      break;
    default:
      fuente = [...entrantes, ...primeros, ...segundos, ...bebidas];
      break;
  }

  return fuente.slice(0, max);
}

export function lineasMarchaPostres(
  comanda: ComandaPostres,
  max = 3,
): string[] {
  return comanda.postres
    .map((p) => (p.cantidad > 1 ? `${p.nombre} x${p.cantidad}` : p.nombre))
    .slice(0, max);
}

export function totalPlatosCocina(comanda: ComandaCocina): number {
  return (
    comanda.entrantes.length +
    comanda.primeros.length +
    comanda.segundos.length +
    comanda.bebidas.length +
    comanda.extras.length
  );
}
