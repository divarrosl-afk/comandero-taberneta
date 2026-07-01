import { etiquetaTipoPlato } from "@/lib/comanda/tipo-plato";
import type { ComandaCocina, PlatoComanda } from "@/types/comanda";

function detallesPlato(plato: PlatoComanda): string[] {
  const partes: string[] = [
    ...etiquetaTipoPlato(plato.tipo, plato.saleComo, plato.suplemento),
    ...plato.modificaciones,
    ...plato.salsas.map((s) => `${s.nombre} x${s.cantidad}`),
  ];

  if (plato.notaLibre) partes.push(plato.notaLibre);

  return partes;
}

function lineaPlato(plato: PlatoComanda): string {
  const cantidad = plato.cantidad > 1 ? ` x${plato.cantidad}` : "";
  const detalles = detallesPlato(plato);
  return detalles.length
    ? `- ${plato.nombre}${cantidad} · ${detalles.join(" · ")}`
    : `- ${plato.nombre}${cantidad}`;
}

function lineaExtra(nombre: string, cantidad: number): string {
  return cantidad > 1 ? `- ${nombre} x${cantidad}` : `- ${nombre}`;
}

export function comandaToTexto(comanda: ComandaCocina): string {
  const lineas: string[] = [
    `MESA ${comanda.mesa} · CAMARERO ${comanda.camarero.toUpperCase()}`,
    "",
  ];

  const secciones: [string, PlatoComanda[]][] = [
    ["ENTRANTES", comanda.entrantes],
    ["PRIMEROS", comanda.primeros],
    ["SEGUNDOS", comanda.segundos],
    ["BEBIDAS", comanda.bebidas],
  ];

  for (const [titulo, platos] of secciones) {
    if (platos.length === 0) continue;
    lineas.push(titulo);
    platos.forEach((p) => lineas.push(lineaPlato(p)));
    lineas.push("");
  }

  if (comanda.extras.length) {
    lineas.push("EXTRAS");
    comanda.extras.forEach((e) => lineas.push(lineaExtra(e.nombre, e.cantidad)));
    lineas.push("");
  }

  if (comanda.observaciones.length) {
    lineas.push("OBSERVACIONES");
    comanda.observaciones.forEach((o) => lineas.push(`- ${o}`));
  }

  return lineas.join("\n").trimEnd();
}
