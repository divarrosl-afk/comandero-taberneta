import type { CartaServicio, ProductoCatalogo } from "@/types/catalogo";

export function productoPerteneceACarta(
  producto: ProductoCatalogo,
  carta: CartaServicio,
): boolean {
  const servicio = producto.cartaServicio;
  if (carta === "almuerzo") {
    return (
      servicio === "almuerzo" ||
      (!servicio &&
        producto.seccion !== "bebidas" &&
        producto.seccion !== "postres")
    );
  }
  if (carta === "bebidas") {
    return servicio === "bebidas" || producto.seccion === "bebidas";
  }
  if (carta === "postres") {
    return servicio === "postres" || producto.seccion === "postres";
  }
  return servicio === "cenas";
}

export function seccionesDeCarta(carta: CartaServicio) {
  if (carta === "bebidas") {
    return [{ id: "bebidas" as const, label: "Bebidas" }];
  }
  if (carta === "postres") {
    return [{ id: "postres" as const, label: "Postres" }];
  }
  if (carta === "cenas") {
    return [
      { id: "entrantes" as const, label: "Entrantes" },
      { id: "primeros" as const, label: "Primeros" },
      { id: "segundos" as const, label: "Segundos" },
    ];
  }
  return [
    { id: "entrantes" as const, label: "Entrantes" },
    { id: "primeros" as const, label: "Primeros" },
    { id: "segundos" as const, label: "Segundos" },
    { id: "extras" as const, label: "Extras" },
    { id: "salsas" as const, label: "Salsas" },
  ];
}
