import { getEstadoXLabel } from "@/data/postres-catalogo";
import type { ComandaPostres, PostreItem } from "@/types/postres";

function lineaPostre(postre: PostreItem): string {
  const cantidad = postre.cantidad > 1 ? ` x${postre.cantidad}` : "";
  const nota = postre.nota ? ` · ${postre.nota}` : "";
  return `- ${postre.nombre}${cantidad}${nota}`;
}

export function comandaPostresToTexto(comanda: ComandaPostres): string {
  const lineas: string[] = [
    `MESA ${comanda.mesa} · CAMARERO ${comanda.camarero.toUpperCase()}`,
    "",
  ];

  if (comanda.postres.length) {
    lineas.push("POSTRES");
    comanda.postres.forEach((p) => lineas.push(lineaPostre(p)));
    lineas.push("");
  }

  if (comanda.estadoX || comanda.clH) {
    lineas.push("---------");
    if (comanda.estadoX) {
      lineas.push(`X: ${getEstadoXLabel(comanda.estadoX)}`);
    } else {
      lineas.push("X");
    }
    if (comanda.clH) {
      lineas.push("C/L + H");
    }
    lineas.push("");
  }

  if (comanda.observaciones.length) {
    lineas.push("OBSERVACIONES");
    comanda.observaciones.forEach((o) => lineas.push(`- ${o}`));
  }

  return lineas.join("\n").trimEnd();
}
