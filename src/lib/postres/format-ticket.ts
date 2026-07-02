import { getNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import { sectionHeader, TICKET_WIDTH_80MM } from "@/lib/comanda/ticket-kitchen";
import { getEstadoXLabel } from "@/data/postres-catalogo";
import type { ComandaPostres, PostreItem } from "@/types/postres";
import type { TicketFormatOptions } from "@/lib/comanda/ticket-kitchen";

function lineaPostre(postre: PostreItem): string {
  const cantidad = postre.cantidad > 1 ? `${postre.cantidad} ` : "";
  const nombre = postre.cantidad > 1
    ? `${cantidad}${postre.nombre.toUpperCase()}`
    : postre.nombre.toUpperCase();
  const nota = postre.nota ? `\n   • ${postre.nota.toUpperCase()}` : "";
  return `${nombre}${nota}`;
}

export function comandaPostresToTexto(
  comanda: ComandaPostres,
  options?: TicketFormatOptions,
): string {
  const width = options?.ancho ?? TICKET_WIDTH_80MM;
  const nombreMesa = options?.nombreMesa ?? getNombreMesaComanda(comanda);
  const lineas: string[] = [
    "=".repeat(width),
    `MESA ${nombreMesa}`,
    "",
    sectionHeader("POSTRES", width),
    "",
  ];

  if (comanda.postres.length) {
    comanda.postres.forEach((p) => lineas.push(lineaPostre(p)));
    lineas.push("");
  }

  if (comanda.estadoX || comanda.clH) {
    if (comanda.estadoX) {
      lineas.push(`X: ${getEstadoXLabel(comanda.estadoX).toUpperCase()}`);
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
    comanda.observaciones.forEach((o) => lineas.push(`   • ${o.toUpperCase()}`));
  }

  return lineas.join("\n").trimEnd();
}
