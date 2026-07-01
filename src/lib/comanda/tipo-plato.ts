import type { TipoPlato, TipoPlatoSeleccion } from "@/types/comanda";

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

export function etiquetaTipoPlato(tipo?: TipoPlato, saleComo?: "primero" | "segundo", suplemento?: number): string[] {
  const partes: string[] = [];

  if (tipo === "menu") partes.push("MENÚ");
  if (tipo === "menu_suplemento") {
    partes.push("MENÚ");
    if (suplemento) partes.push(`+ SUPLEMENTO +${suplemento}€`);
  }
  if (tipo === "carta") {
    partes.push("CARTA");
    if (saleComo === "primero") partes.push("SALE COMO PRIMERO");
    if (saleComo === "segundo") partes.push("SALE COMO SEGUNDO");
  }

  return partes;
}
