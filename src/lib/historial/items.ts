import { comandaToTexto } from "@/lib/comanda/format-ticket";
import { getComandasSync } from "@/lib/comandas/comandas-service";
import { getNombreMesaComanda } from "@/lib/mesas/resolve-mesa";
import { comandaPostresToTexto } from "@/lib/postres/format-ticket";
import { getPostresSync } from "@/lib/postres/postres-service";
import type { ComandaCocina } from "@/types/comanda";
import type { HistorialItem, HistorialTipo } from "@/types/panel";
import type { ComandaPostres } from "@/types/postres";

export type HistorialEntrada =
  | { tipo: "cocina"; comanda: ComandaCocina }
  | { tipo: "postres"; comanda: ComandaPostres };

export function getHistorialEntradas(): HistorialEntrada[] {
  const cocina = getComandasSync().map(
    (comanda): HistorialEntrada => ({ tipo: "cocina", comanda }),
  );
  const postres = getPostresSync().map(
    (comanda): HistorialEntrada => ({ tipo: "postres", comanda }),
  );

  return [...cocina, ...postres].sort(
    (a, b) =>
      new Date(b.comanda.creadaEn).getTime() -
      new Date(a.comanda.creadaEn).getTime(),
  );
}

export function entradaToHistorialItem(entrada: HistorialEntrada): HistorialItem {
  return {
    id: entrada.comanda.id,
    tipo: entrada.tipo,
    mesa: entrada.comanda.mesa,
    camarero: entrada.comanda.camarero,
    creadaEn: entrada.comanda.creadaEn,
    estadoPanel: entrada.comanda.estadoPanel,
  };
}

export function entradaToTicket(entrada: HistorialEntrada): string {
  const options = { nombreMesa: getNombreMesaComanda(entrada.comanda) };
  return entrada.tipo === "cocina"
    ? comandaToTexto(entrada.comanda, options)
    : comandaPostresToTexto(entrada.comanda, options);
}

export function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatFechaHora(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function tipoLabel(tipo: HistorialTipo): string {
  return tipo === "cocina" ? "Cocina" : "Postres";
}
