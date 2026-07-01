import type { ProductoCatalogo, SeccionCatalogo } from "@/types/catalogo";

function item(
  nombre: string,
  seccion: SeccionCatalogo,
  opts?: Partial<Pick<ProductoCatalogo, "precio" | "suplemento" | "favorito" | "activo">>,
): ProductoCatalogo {
  return {
    id: crypto.randomUUID(),
    nombre,
    seccion,
    activo: opts?.activo ?? true,
    favorito: opts?.favorito ?? false,
    precio: opts?.precio,
    suplemento: opts?.suplemento,
  };
}

/** Catálogo inicial — se usa solo si no hay datos en localStorage */
export function crearCatalogoDefault(): ProductoCatalogo[] {
  return [
    // Entrantes
    item("Croquetas jamón", "entrantes", { favorito: true }),
    item("Pan con tomate", "entrantes", { favorito: true }),
    item("Ensaladilla", "entrantes"),
    item("Chipirones", "entrantes"),
    // Primeros
    item("Gazpacho", "primeros", { favorito: true }),
    item("Burrata", "primeros", { favorito: true, suplemento: 5 }),
    item("Macarrones", "primeros"),
    item("Ensalada mixta", "primeros"),
    // Segundos
    item("Bistec", "segundos", { favorito: true }),
    item("Hamburguesa Angus", "segundos", { favorito: true }),
    item("Entrecot", "segundos", { precio: 18 }),
    item("Lubina plancha", "segundos"),
    // Bebidas
    item("Agua", "bebidas", { favorito: true }),
    item("Copa vino", "bebidas", { favorito: true }),
    item("Caña", "bebidas", { favorito: true }),
    item("Refresco", "bebidas"),
    item("Cerveza sin alcohol", "bebidas"),
    // Postres
    item("Tarta de queso", "postres", { favorito: true }),
    item("Mousse de limón", "postres", { favorito: true }),
    item("Tarta tres chocolates", "postres"),
    item("Flan", "postres"),
    item("Crema catalana", "postres"),
    item("Helado", "postres"),
    item("Fruta", "postres"),
    item("Café solo", "postres", { favorito: true }),
    item("Cortado", "postres"),
    item("Café con leche", "postres"),
    item("Infusión", "postres"),
    // Extras
    item("Pan", "extras", { favorito: true }),
    item("Pan sin gluten", "extras"),
    item("Cubiertos", "extras", { favorito: true }),
    item("Plato vacío", "extras"),
    item("Servilletas", "extras"),
    item("Hielo", "extras", { favorito: true }),
    item("Limón", "extras"),
    // Salsas
    item("Alioli", "salsas", { favorito: true }),
    item("Mayonesa", "salsas"),
    item("Ketchup", "salsas"),
    item("Salsa brava", "salsas", { favorito: true }),
    item("Salsa pimienta", "salsas"),
    item("Salsa roquefort", "salsas"),
  ];
}
