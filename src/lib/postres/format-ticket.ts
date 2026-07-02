import { getNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import { sectionHeader, TICKET_WIDTH_80MM } from "@/lib/comanda/ticket-kitchen";
import { getEstadoXCafeLabel } from "@/data/postres-catalogo";
import { normalizeComandaPostres } from "@/lib/postres/normalize-comanda";
import type { ComandaPostres, PostreItem } from "@/types/postres";
import type { TicketFormatOptions } from "@/lib/comanda/ticket-kitchen";

function lineaItem(item: PostreItem): string {
  const cantidad = item.cantidad > 1 ? `${item.cantidad} ` : "";
  const nombre =
    item.cantidad > 1
      ? `${cantidad}${item.nombre.toUpperCase()}`
      : item.nombre.toUpperCase();
  const nota = item.nota ? `\n   • ${item.nota.toUpperCase()}` : "";
  return `${nombre}${nota}`;
}

function tieneSeccionPostres(comanda: ComandaPostres): boolean {
  return comanda.postres.length > 0;
}

function tieneSeccionCafes(comanda: ComandaPostres): boolean {
  return (
    comanda.cafes.length > 0 ||
    comanda.estadoXCafe !== null ||
    comanda.clH
  );
}

export function comandaPostresToTexto(
  comanda: ComandaPostres,
  options?: TicketFormatOptions,
): string {
  const normalizada = normalizeComandaPostres(comanda);
  const width = options?.ancho ?? TICKET_WIDTH_80MM;
  const nombreMesa = options?.nombreMesa ?? getNombreMesaComanda(normalizada);
  const lineas: string[] = [
    "=".repeat(width),
    `MESA ${nombreMesa}`,
    "",
  ];

  if (tieneSeccionPostres(normalizada)) {
    lineas.push(sectionHeader("POSTRES", width), "");

    normalizada.postres.forEach((p) => lineas.push(lineaItem(p)));
    lineas.push("");
  }

  if (tieneSeccionCafes(normalizada)) {
    lineas.push(sectionHeader("CAFES", width), "");

    if (normalizada.estadoXCafe) {
      lineas.push(
        `X: ${getEstadoXCafeLabel(normalizada.estadoXCafe).toUpperCase()}`,
      );
    }

    normalizada.cafes.forEach((c) => lineas.push(lineaItem(c)));

  if (normalizada.clH && !normalizada.cafes.some((c) => c.nombre === "C/L + H")) {
      lineas.push("C/L + H");
    }

    lineas.push("");
  }

  if (normalizada.observaciones.length) {
    lineas.push("OBSERVACIONES");
    normalizada.observaciones.forEach((o) => lineas.push(` - ${o.toUpperCase()}`));
  }

  return lineas.join("\n").trimEnd();
}
