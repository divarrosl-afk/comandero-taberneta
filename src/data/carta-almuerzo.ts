import { createId } from "@/lib/id/create-id";
import type { CartaServicio, ProductoCatalogo, SeccionCatalogo } from "@/types/catalogo";

type ItemOpts = Partial<
  Pick<
    ProductoCatalogo,
    | "nombreCorto"
    | "precioCarta"
    | "favorito"
    | "descripcionCamarero"
    | "ingredientes"
    | "alergenos"
    | "recomendado"
    | "orden"
  >
>;

function plato(
  nombre: string,
  seccion: SeccionCatalogo,
  precioCarta: number,
  opts?: ItemOpts,
): ProductoCatalogo {
  return {
    id: createId(),
    nombre,
    nombreCorto: opts?.nombreCorto,
    seccion,
    tipo: "carta",
    cartaServicio: "almuerzo",
    precio: precioCarta,
    precioCarta,
    activo: true,
    agotado: false,
    favorito: opts?.favorito ?? false,
    orden: opts?.orden ?? 0,
    descripcionCamarero: opts?.descripcionCamarero,
    ingredientes: opts?.ingredientes ?? [],
    alergenos: opts?.alergenos ?? [],
    recomendado: opts?.recomendado ?? false,
  };
}

/** Platos reales de la carta de almuerzo (PDF La Taberneta) */
export function crearCartaAlmuerzo(): ProductoCatalogo[] {
  let orden = 0;
  const next = () => ++orden * 10;

  return [
    // —— Tapas ——
    plato("Croquetas caseras", "entrantes", 1.5, {
      nombreCorto: "Croquetas",
      favorito: true,
      orden: next(),
      descripcionCamarero: "Precio por unidad",
      alergenos: ["gluten", "huevo", "lactosa"],
    }),
    plato("Jalapeños rellenos de queso cheddar", "entrantes", 9, {
      nombreCorto: "Jalapeños",
      orden: next(),
      alergenos: ["lactosa"],
    }),
    plato("Patatas bravas", "entrantes", 6, {
      favorito: true,
      orden: next(),
    }),
    plato('Patatas "Ca La Ingrid"', "entrantes", 7, {
      nombreCorto: "Patatas CL Ingrid",
      orden: next(),
      descripcionCamarero: "Con alioli y salsa romesco",
    }),
    plato("Morros", "entrantes", 7, { orden: next() }),
    plato("Torreznos", "entrantes", 9, { orden: next() }),
    plato("Chistorra", "entrantes", 9, { orden: next() }),
    plato("Pinchos", "entrantes", 12, { orden: next() }),
    plato("Escalivada", "entrantes", 6, { orden: next() }),
    plato("Boquerones en vinagre", "entrantes", 12, {
      orden: next(),
      alergenos: ["pescado"],
    }),
    plato("Sevillanos", "entrantes", 7, { orden: next() }),
    plato("Rabas", "entrantes", 15, {
      orden: next(),
      alergenos: ["marisco", "gluten"],
    }),
    plato("Sepia troceada", "entrantes", 22, {
      orden: next(),
      alergenos: ["marisco"],
    }),
    plato("Pulpo a la gallega", "entrantes", 14, {
      favorito: true,
      orden: next(),
      alergenos: ["marisco"],
    }),
    plato("Tallarines salteados con ajo y perejil", "entrantes", 15, {
      nombreCorto: "Tallarines",
      orden: next(),
      alergenos: ["gluten", "marisco"],
    }),
    plato("Almejas a la marinera", "entrantes", 13, {
      orden: next(),
      alergenos: ["marisco"],
    }),
    plato("Mejillones al vapor", "entrantes", 15, {
      orden: next(),
      alergenos: ["marisco"],
    }),
    plato("Gambas al ajillo", "entrantes", 10, {
      favorito: true,
      orden: next(),
      alergenos: ["marisco"],
    }),
    plato("Twister de langostinos", "entrantes", 12, {
      orden: next(),
      alergenos: ["marisco", "gluten"],
    }),
    plato("Bacalao a la llauna", "entrantes", 15, {
      orden: next(),
      alergenos: ["pescado"],
    }),
    plato(
      "Carpaccio de solomillo de ternera con parmesano",
      "entrantes",
      16,
      {
        nombreCorto: "Carpaccio",
        orden: next(),
        alergenos: ["lactosa"],
      },
    ),
    plato("Jamón ibérico al plato", "entrantes", 18, {
      orden: next(),
    }),
    plato("Cordero (5 piezas)", "entrantes", 15, {
      nombreCorto: "Cordero",
      orden: next(),
      descripcionCamarero: "Guarnición a elegir: patata fritas, al caliu o judías",
    }),
    plato("Foie con mermelada de higos", "entrantes", 12, {
      orden: next(),
    }),
    plato("Pincho de tortilla", "entrantes", 5, { orden: next(), alergenos: ["huevo"] }),

    // —— Ensaladas ——
    plato("Burrata", "primeros", 10, {
      favorito: true,
      orden: next(),
      alergenos: ["lactosa"],
    }),
    plato("Queso de cabra", "primeros", 10, {
      orden: next(),
      alergenos: ["lactosa"],
    }),
    plato('Xató "Ca La Ingrid"', "primeros", 10, {
      nombreCorto: "Xató",
      orden: next(),
      alergenos: ["pescado", "frutos-secos"],
    }),
    plato("Escalopa de pollo", "primeros", 12, {
      orden: next(),
      descripcionCamarero: "Lechuga, tomate, aros rebozados y salsa brava",
      alergenos: ["gluten", "huevo"],
    }),

    // —— Hamburguesas ——
    plato("Hamburguesa Angus", "segundos", 15, {
      nombreCorto: "Angus",
      favorito: true,
      orden: next(),
      alergenos: ["gluten", "huevo", "lactosa"],
    }),
    plato('Hamburguesa completa "Ca La Ingrid"', "segundos", 18, {
      nombreCorto: "Completa CL Ingrid",
      orden: next(),
      descripcionCamarero:
        "Queso de cabra, bacon, cebolla caramelizada y salsa especial",
      alergenos: ["gluten", "huevo", "lactosa"],
    }),
    plato("Hamburguesa (150 gr)", "segundos", 12, {
      nombreCorto: "Hamburguesa",
      orden: next(),
      descripcionCamarero: "Lechuga, tomate, cebolla frita, queso, huevo frito y mayonesa",
      alergenos: ["gluten", "huevo", "lactosa"],
    }),

    // —— Carnes brasa y guisadas ——
    plato("Bistec", "segundos", 22, {
      favorito: true,
      orden: next(),
      descripcionCamarero: "Todo acompañado de fritas",
    }),
    plato("Meloso de ternera", "segundos", 18, {
      orden: next(),
      descripcionCamarero: "Estofado al vino tinto. Con fritas",
    }),
    plato('Callos con "cap i pota"', "segundos", 18, {
      orden: next(),
    }),
    plato("Rabo de toro", "segundos", 25, { orden: next() }),
    plato("Butifarra", "segundos", 25, { orden: next() }),
    plato("Butifarra negra", "segundos", 12, { orden: next() }),
    plato("Butifarra de pies de cerdo", "segundos", 13, {
      nombreCorto: "Butifarra pies",
      orden: next(),
    }),
    plato("Pies de cerdo", "segundos", 13, { orden: next() }),
    plato("Morro de cerdo", "segundos", 10, { orden: next() }),
    plato("Entrecot de ternera", "segundos", 10, {
      orden: next(),
      recomendado: true,
    }),
    plato("Abanico ibérico", "segundos", 12, { orden: next() }),
    plato("Lagarto ibérico", "segundos", 15, { orden: next() }),
    plato("Chuletón de ternera", "segundos", 11, { orden: next() }),
    plato("Solomillo de ternera", "segundos", 15, { orden: next() }),

    // —— Torradas ——
    plato("Torrada escalivada y queso de cabra", "entrantes", 8.5, {
      nombreCorto: "Torr. escalivada cabra",
      orden: next(),
      alergenos: ["lactosa", "gluten"],
    }),
    plato("Torrada escalivada, atún, anchoas y olivas", "entrantes", 9, {
      nombreCorto: "Torr. escalivada atún",
      orden: next(),
      alergenos: ["pescado", "gluten"],
    }),
    plato("Torrada escalivada, butifarra y cebolla", "entrantes", 10, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato(
      "Torrada butifarra con queso, cebolla y pimiento verde",
      "entrantes",
      10,
      { nombreCorto: "Torr. butifarra", orden: next(), alergenos: ["lactosa", "gluten"] },
    ),
    plato("Torrada panceta con ali-oli", "entrantes", 9, {
      orden: next(),
      alergenos: ["huevo", "gluten"],
    }),
    plato("Torrada bacon y queso", "entrantes", 6.5, {
      orden: next(),
      alergenos: ["lactosa", "gluten"],
    }),
    plato("Torrada bacon, queso de cabra y cebolla", "entrantes", 10, {
      orden: next(),
      alergenos: ["lactosa", "gluten"],
    }),
    plato(
      "Torrada lomo, queso, cebolla y pimiento verde",
      "entrantes",
      10,
      { nombreCorto: "Torr. lomo", orden: next(), alergenos: ["lactosa", "gluten"] },
    ),
    plato("Torrada tortilla de patata", "entrantes", 6.5, {
      orden: next(),
      alergenos: ["huevo", "gluten"],
    }),
    plato("Torrada tortilla de verduras", "entrantes", 10, {
      orden: next(),
      alergenos: ["huevo", "gluten"],
    }),
    plato("Torrada pinchos con allioli y pimiento verde", "entrantes", 10, {
      nombreCorto: "Torr. pinchos",
      orden: next(),
      alergenos: ["huevo", "gluten"],
    }),
    plato("Torrada sobrasada con queso de cabra y miel", "entrantes", 11, {
      orden: next(),
      alergenos: ["lactosa", "gluten"],
    }),
    plato("Torrada vegetariana", "entrantes", 10, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Torrada salmón y aguacate", "entrantes", 10, {
      orden: next(),
      alergenos: ["pescado", "gluten"],
    }),
    plato("Torrada pollo con salsa roquefort", "entrantes", 10, {
      orden: next(),
      alergenos: ["lactosa", "gluten"],
    }),
    plato("Torrada de jamón ibérico", "entrantes", 14, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Torrada de embutidos ibéricos", "entrantes", 15, {
      orden: next(),
      alergenos: ["gluten"],
    }),

    // —— Bocadillos calientes ——
    plato("Bocadillo lomo", "entrantes", 6.5, {
      nombreCorto: "Boc. lomo",
      orden: next(),
      descripcionCamarero: "Precio grande",
      alergenos: ["gluten"],
    }),
    plato("Bocadillo tortilla francesa", "entrantes", 9, {
      nombreCorto: "Boc. tor. francesa",
      orden: next(),
      alergenos: ["huevo", "gluten"],
    }),
    plato("Bocadillo tortilla de patata", "entrantes", 12, {
      nombreCorto: "Boc. tor. patata",
      orden: next(),
      alergenos: ["huevo", "gluten"],
    }),
    plato("Bocadillo panceta", "entrantes", 10, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bocadillo butifarra", "entrantes", 10, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bocadillo butifarra negra", "entrantes", 10, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bocadillo morcilla", "entrantes", 6.5, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bocadillo chistorra", "entrantes", 6.5, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bocadillo serranito", "entrantes", 10, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bocadillo sobrasada", "entrantes", 10, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bocadillo vegetal de pollo", "entrantes", 10, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bocadillo pollo", "entrantes", 10, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bocadillo pinchos", "entrantes", 10, {
      orden: next(),
      alergenos: ["gluten"],
    }),

    // —— Bocadillos fríos ——
    plato("Bocadillo jamón del país", "entrantes", 7, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bocadillo jamón ibérico", "entrantes", 8, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bocadillo jamón dulce y queso", "entrantes", 7, {
      orden: next(),
      alergenos: ["lactosa", "gluten"],
    }),
    plato("Bocadillo butifarra blanca", "entrantes", 6, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bocadillo queso manchego", "entrantes", 5, {
      orden: next(),
      alergenos: ["lactosa", "gluten"],
    }),
    plato("Bocadillo atún", "entrantes", 4.5, {
      orden: next(),
      alergenos: ["pescado", "gluten"],
    }),
    plato("Bocadillo fuet", "entrantes", 4.5, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bocadillo longaniza", "entrantes", 4.5, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bocadillo chorizo", "entrantes", 5, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bocadillo vegetal atún", "entrantes", 7, {
      orden: next(),
      alergenos: ["pescado", "gluten"],
    }),
    plato("Bocadillo mediterráneo", "entrantes", 8, {
      orden: next(),
      alergenos: ["gluten"],
    }),
    plato("Bikini", "entrantes", 3, {
      orden: next(),
      alergenos: ["lactosa", "gluten"],
    }),

    // —— Desayuno ——
    plato("Desayuno pollo", "entrantes", 8.5, { orden: next(), alergenos: ["gluten"] }),
    plato("Desayuno lomo", "entrantes", 9, { orden: next(), alergenos: ["gluten"] }),
    plato("Desayuno bacon", "entrantes", 10, { orden: next(), alergenos: ["gluten"] }),
    plato("Desayuno panceta", "entrantes", 9, { orden: next(), alergenos: ["gluten"] }),
    plato("Desayuno salchichas", "entrantes", 9, { orden: next(), alergenos: ["gluten"] }),

    // —— Extras y suplementos de carta ——
    plato("Pan torrado", "extras", 1.5, { orden: next(), alergenos: ["gluten"] }),
    plato("Extra ensalada", "extras", 3, { nombreCorto: "Ensalada", orden: next() }),
    plato("Extra fritas", "extras", 2, { nombreCorto: "Fritas", favorito: true, orden: next() }),
    plato("Extra bravas", "extras", 2.5, { nombreCorto: "Bravas", orden: next() }),
    plato("Extra champiñones", "extras", 2, {
      nombreCorto: "Champiñones",
      orden: next(),
      descripcionCamarero: "Suplemento +2€ en guarnición",
    }),
    plato("Extra bacon", "extras", 0.6, { nombreCorto: "Bacon", orden: next() }),
    plato("Extra jamón del país", "extras", 3, { orden: next() }),
    plato("Extra jamón ibérico", "extras", 5, { orden: next() }),
    plato("Extra jamón dulce y queso", "extras", 3, {
      orden: next(),
      alergenos: ["lactosa"],
    }),
    plato("Extra butifarra blanca", "extras", 5, { orden: next() }),
    plato("Extra queso manchego", "extras", 4, {
      orden: next(),
      alergenos: ["lactosa"],
    }),
    plato("Extra atún", "extras", 3.5, {
      orden: next(),
      alergenos: ["pescado"],
    }),
    plato("Extra fuet", "extras", 3, { orden: next() }),
    plato("Extra longaniza", "extras", 3, { orden: next() }),
    plato("Extra chorizo", "extras", 4, { orden: next() }),
    plato("Extra vegetal atún", "extras", 5, {
      orden: next(),
      alergenos: ["pescado"],
    }),
    plato("Extra mediterráneo", "extras", 6, { orden: next() }),
    plato("Extra pollo", "extras", 2, { orden: next() }),
    plato("Extra lomo", "extras", 3, { orden: next() }),
    plato("Extra panceta", "extras", 2.75, { orden: next() }),
    plato("Extra salchichas", "extras", 1.5, { orden: next() }),
    plato("Extra pimiento", "extras", 2, { orden: next() }),
    plato("Extra alubias (mongetes)", "extras", 3, {
      nombreCorto: "Mongetes",
      orden: next(),
    }),
    plato("Extra escalivada", "extras", 2, {
      orden: next(),
      descripcionCamarero: "Suplemento +3€ en guarnición",
    }),
    plato("Extra huevos", "extras", 2.75, {
      nombreCorto: "Huevos",
      orden: next(),
      alergenos: ["huevo"],
    }),
    plato("Extra alcachofas (temporada)", "extras", 3, {
      nombreCorto: "Alcachofas",
      orden: next(),
    }),

    // —— Operativa comandero ——
    plato("Pan", "extras", 0, {
      favorito: true,
      orden: next(),
      alergenos: ["gluten"],
      descripcionCamarero: "Sin cargo",
    }),
    plato("Cubiertos", "extras", 0, {
      favorito: true,
      orden: next(),
      descripcionCamarero: "Sin cargo",
    }),
    plato("Plato vacío", "extras", 0, { orden: next() }),
    plato("Servilletas", "extras", 0, { orden: next() }),
    plato("Hielo", "extras", 0, { favorito: true, orden: next() }),
    plato("Limón", "extras", 0, { orden: next() }),

    // —— Salsas ——
    plato("Alioli", "salsas", 0.6, {
      favorito: true,
      orden: next(),
      alergenos: ["huevo"],
    }),
    plato("Salsa romesco", "salsas", 3, { orden: next(), alergenos: ["frutos-secos"] }),
    plato("Salsa roquefort", "salsas", 3, {
      orden: next(),
      alergenos: ["lactosa"],
    }),
    plato("Mayonesa", "salsas", 0, {
      orden: next(),
      alergenos: ["huevo"],
      descripcionCamarero: "Consultar precio",
    }),
  ];
}

/** Bebidas básicas (vinos se añadirán después) */
export function crearBebidasBase(): ProductoCatalogo[] {
  let orden = 0;
  const next = () => ++orden * 10;

  const bebida = (
    nombre: string,
    precioCarta: number,
    opts?: Partial<Pick<ProductoCatalogo, "nombreCorto" | "favorito">>,
  ): ProductoCatalogo => ({
    id: createId(),
    nombre,
    nombreCorto: opts?.nombreCorto,
    seccion: "bebidas",
    tipo: "carta",
    cartaServicio: "bebidas",
    precio: precioCarta,
    precioCarta,
    activo: true,
    agotado: false,
    favorito: opts?.favorito ?? false,
    orden: next(),
    ingredientes: [],
    alergenos: [],
    recomendado: false,
  });

  return [
    bebida("Agua", 2, { favorito: true }),
    bebida("Caña", 2.5, { favorito: true }),
    bebida("Refresco", 2.5),
    bebida("Cerveza sin alcohol", 2.5),
  ];
}

export function filtrarPorCartaServicio(
  productos: ProductoCatalogo[],
  servicio: CartaServicio,
): ProductoCatalogo[] {
  return productos.filter((p) => p.cartaServicio === servicio);
}
