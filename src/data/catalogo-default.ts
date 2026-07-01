import type { ProductoCatalogo, SeccionCatalogo } from "@/types/catalogo";

function item(
  nombre: string,
  seccion: SeccionCatalogo,
  opts?: Partial<
    Pick<
      ProductoCatalogo,
      | "precioCarta"
      | "precio"
      | "precioMenu"
      | "suplemento"
      | "favorito"
      | "activo"
      | "tipo"
      | "nombreCorto"
      | "ingredientes"
      | "alergenos"
      | "descripcionCamarero"
      | "recomendado"
    >
  >,
): ProductoCatalogo {
  const precioCarta = opts?.precioCarta ?? opts?.precio;
  return {
    id: crypto.randomUUID(),
    nombre,
    nombreCorto: opts?.nombreCorto,
    seccion,
    tipo: opts?.tipo ?? (opts?.suplemento ? "menu-dia" : "ambos"),
    precio: precioCarta,
    precioCarta,
    precioMenu: opts?.precioMenu,
    suplemento: opts?.suplemento,
    activo: opts?.activo ?? true,
    agotado: false,
    favorito: opts?.favorito ?? false,
    orden: 0,
    descripcionCamarero: opts?.descripcionCamarero,
    ingredientes: opts?.ingredientes ?? [],
    alergenos: opts?.alergenos ?? [],
    recomendado: opts?.recomendado ?? false,
  };
}

/** Catálogo inicial — se usa solo si no hay datos en localStorage */
export function crearCatalogoDefault(): ProductoCatalogo[] {
  return [
    item("Croquetas jamón", "entrantes", {
      favorito: true,
      nombreCorto: "Croquetas",
      ingredientes: ["jamón", "bechamel", "pan rallado"],
      alergenos: ["gluten", "huevo", "lactosa"],
    }),
    item("Pan con tomate", "entrantes", {
      favorito: true,
      nombreCorto: "Pan tomate",
      alergenos: ["gluten"],
    }),
    item("Ensaladilla", "entrantes"),
    item("Chipirones", "entrantes", { alergenos: ["marisco", "gluten"] }),
    item("Gazpacho", "primeros", {
      favorito: true,
      tipo: "ambos",
      ingredientes: ["tomate", "pepino", "pimiento"],
    }),
    item("Burrata", "primeros", {
      favorito: true,
      suplemento: 5,
      tipo: "menu-dia",
      ingredientes: ["burrata", "tomate", "rúcula"],
      alergenos: ["lactosa"],
    }),
    item("Macarrones", "primeros", { tipo: "ambos", alergenos: ["gluten", "huevo"] }),
    item("Ensalada mixta", "primeros", { tipo: "ambos" }),
    item("Bistec", "segundos", { favorito: true, tipo: "ambos" }),
    item("Hamburguesa Angus", "segundos", {
      favorito: true,
      nombreCorto: "Hamburguesa",
      tipo: "ambos",
      alergenos: ["gluten", "huevo"],
    }),
    item("Entrecot", "segundos", {
      precioCarta: 18,
      tipo: "carta",
      recomendado: true,
    }),
    item("Lubina plancha", "segundos", { tipo: "ambos", alergenos: ["pescado"] }),
    item("Agua", "bebidas", { favorito: true, tipo: "carta", precioCarta: 2 }),
    item("Copa vino", "bebidas", { favorito: true, tipo: "carta", precioCarta: 3.5 }),
    item("Caña", "bebidas", { favorito: true, tipo: "carta", precioCarta: 2.5 }),
    item("Refresco", "bebidas", { tipo: "carta", precioCarta: 2.5 }),
    item("Cerveza sin alcohol", "bebidas", { tipo: "carta" }),
    item("Tarta de queso", "postres", { favorito: true, alergenos: ["lactosa", "huevo", "gluten"] }),
    item("Mousse de limón", "postres", { favorito: true, alergenos: ["huevo", "lactosa"] }),
    item("Tarta tres chocolates", "postres"),
    item("Flan", "postres", { alergenos: ["huevo", "lactosa"] }),
    item("Crema catalana", "postres", { alergenos: ["huevo", "lactosa"] }),
    item("Helado", "postres"),
    item("Fruta", "postres"),
    item("Café solo", "postres", { favorito: true, tipo: "carta" }),
    item("Cortado", "postres", { tipo: "carta" }),
    item("Café con leche", "postres", { tipo: "carta", alergenos: ["lactosa"] }),
    item("Infusión", "postres", { tipo: "carta" }),
    item("Pan", "extras", { favorito: true, tipo: "carta", alergenos: ["gluten"] }),
    item("Pan sin gluten", "extras", { tipo: "carta" }),
    item("Cubiertos", "extras", { favorito: true, tipo: "carta" }),
    item("Plato vacío", "extras", { tipo: "carta" }),
    item("Servilletas", "extras", { tipo: "carta" }),
    item("Hielo", "extras", { favorito: true, tipo: "carta" }),
    item("Limón", "extras", { tipo: "carta" }),
    item("Alioli", "salsas", { favorito: true, tipo: "carta", alergenos: ["huevo"] }),
    item("Mayonesa", "salsas", { tipo: "carta", alergenos: ["huevo"] }),
    item("Ketchup", "salsas", { tipo: "carta" }),
    item("Salsa brava", "salsas", { favorito: true, tipo: "carta" }),
    item("Salsa pimienta", "salsas", { tipo: "carta" }),
    item("Salsa roquefort", "salsas", { tipo: "carta", alergenos: ["lactosa"] }),
  ];
}
