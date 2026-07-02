import { comandaToTexto } from "@/lib/comanda/format-ticket";
import type { ComandaCocina } from "@/types/comanda";

function cabecera(comanda: ComandaCocina): string[] {
  return [`MESA ${comanda.mesa}`, ""];
}

export function comandaToTicketCocina(comanda: ComandaCocina): string {
  const lineas = [...cabecera(comanda)];

  const secciones: [string, typeof comanda.entrantes][] = [
    ["ENTRANTES", comanda.entrantes],
    ["PRIMEROS", comanda.primeros],
    ["SEGUNDOS", comanda.segundos],
  ];

  for (const [titulo, platos] of secciones) {
    if (!platos.length) continue;
    lineas.push(titulo);
    platos.forEach((p) => {
      const c = p.cantidad > 1 ? ` x${p.cantidad}` : "";
      const det = [
        ...(p.modificaciones ?? []),
        ...(p.salsas?.map((s) => `${s.nombre} x${s.cantidad}`) ?? []),
        ...(p.notaLibre ? [p.notaLibre] : []),
      ];
      lineas.push(
        det.length
          ? `- ${p.nombre}${c} · ${det.join(" · ")}`
          : `- ${p.nombre}${c}`,
      );
    });
    lineas.push("");
  }

  if (comanda.extras.length) {
    lineas.push("EXTRAS");
    comanda.extras.forEach((e) =>
      lineas.push(
        e.cantidad > 1 ? `- ${e.nombre} x${e.cantidad}` : `- ${e.nombre}`,
      ),
    );
    lineas.push("");
  }

  if (comanda.observaciones.length) {
    lineas.push("OBSERVACIONES");
    comanda.observaciones.forEach((o) => lineas.push(`- ${o}`));
  }

  return lineas.join("\n").trimEnd();
}

export function comandaToTicketBarra(comanda: ComandaCocina): string | null {
  const tieneBebidas = comanda.bebidas.length > 0;
  const extrasBarra = comanda.extras.filter((e) =>
    /hielo|limón|limon|pan|cubiertos/i.test(e.nombre),
  );
  const tieneObs = comanda.observaciones.length > 0;

  if (!tieneBebidas && !extrasBarra.length && !tieneObs) return null;

  const lineas = [...cabecera(comanda)];

  if (tieneBebidas) {
    lineas.push("BEBIDAS");
    comanda.bebidas.forEach((p) => {
      const c = p.cantidad > 1 ? ` x${p.cantidad}` : "";
      const det = [
        ...(p.modificaciones ?? []),
        ...(p.notaLibre ? [p.notaLibre] : []),
      ];
      lineas.push(
        det.length
          ? `- ${p.nombre}${c} · ${det.join(" · ")}`
          : `- ${p.nombre}${c}`,
      );
    });
    lineas.push("");
  }

  if (extrasBarra.length) {
    lineas.push("EXTRAS");
    extrasBarra.forEach((e) =>
      lineas.push(
        e.cantidad > 1 ? `- ${e.nombre} x${e.cantidad}` : `- ${e.nombre}`,
      ),
    );
    lineas.push("");
  }

  if (tieneObs) {
    lineas.push("OBSERVACIONES");
    comanda.observaciones.forEach((o) => lineas.push(`- ${o}`));
  }

  return lineas.join("\n").trimEnd();
}

/** Ticket completo cocina (incluye bebidas) — útil para reimpresión */
export function comandaToTicketCompleto(comanda: ComandaCocina): string {
  return comandaToTexto(comanda);
}
