import { CARTAS_RESTAURANTE, type ItemCarta } from "@/data/cartas-restaurante";
import { createId } from "@/lib/id/create-id";
import type {
  CartaServicio,
  CategoriaCarta,
  ProductoCatalogo,
  SeccionCatalogo,
  UsoComanda,
} from "@/types/catalogo";

const USOS_PLATO: UsoComanda[] = ["entrantes", "primeros", "segundos"];

const USO_POR_CATEGORIA_ALMUERZO: Record<
  keyof typeof CARTAS_RESTAURANTE.cartaAlmuerzo,
  UsoComanda[]
> = {
  tapas: USOS_PLATO,
  hamburguesas: USOS_PLATO,
  carnesGuisadas: USOS_PLATO,
  carnesBrasa: USOS_PLATO,
  ensaladas: USOS_PLATO,
  infantil: USOS_PLATO,
  bocadillosCalientes: USOS_PLATO,
  bocadillosFrios: USOS_PLATO,
  torradas: USOS_PLATO,
  platosCombinados: USOS_PLATO,
  extrasSuplementos: ["extras"],
};

const DESCRIPCION_CARNES_BRASA =
  "Guarnición obligatoria: patatas fritas, patata al caliu o judías. Suplementos: champiñones +2€, escalivada +3€";

const DESCRIPCION_INFANTIL = "Acompañado de patatas fritas";

const USO_POR_CATEGORIA_CENAS: Record<
  keyof typeof CARTAS_RESTAURANTE.cartaCenas,
  UsoComanda[]
> = {
  tapasYRaciones: ["entrantes"],
  hamburguesas: ["segundos"],
  torradas: ["entrantes", "segundos"],
  brasa: ["segundos"],
};

const USO_POR_CATEGORIA_VINOS: Record<
  keyof typeof CARTAS_RESTAURANTE.cartaVinosPostres.vinos,
  UsoComanda[]
> = {
  blancos: ["bebidas"],
  tintos: ["bebidas"],
  rosados: ["bebidas"],
  cavas: ["bebidas"],
  corpinnats: ["bebidas"],
};

function seccionDeUso(usos: UsoComanda[]): SeccionCatalogo {
  if (usos.includes("extras")) return "extras";
  if (usos.includes("bebidas")) return "bebidas";
  if (usos.includes("postres")) return "postres";
  if (usos.includes("primeros")) return "primeros";
  if (usos.includes("segundos")) return "segundos";
  return "entrantes";
}

function descripcionItem(
  item: ItemCarta,
  categoria?: CategoriaCarta,
): string | undefined {
  const partes: string[] = [];
  if (categoria === "carnesBrasa") {
    partes.push(DESCRIPCION_CARNES_BRASA);
  }
  if (categoria === "infantil") {
    partes.push(DESCRIPCION_INFANTIL);
  }
  if (item.descripcion) partes.push(item.descripcion);
  if (item.zona) partes.push(item.zona);
  if (item.bodega) partes.push(item.bodega);
  if (item.tipo) partes.push(item.tipo);
  if (item.unidad) partes.push("Precio por unidad");
  return partes.length > 0 ? partes.join(" · ") : undefined;
}

function crearProducto(
  nombre: string,
  precio: number,
  opts: {
    cartaServicio: CartaServicio;
    categoriaCarta: CategoriaCarta;
    usosComanda: UsoComanda[];
    nombreCorto?: string;
    descripcionCamarero?: string;
    favorito?: boolean;
    orden: number;
  },
): ProductoCatalogo {
  return {
    id: createId(),
    nombre,
    nombreCorto: opts.nombreCorto,
    seccion: seccionDeUso(opts.usosComanda),
    tipo: "carta",
    cartaServicio: opts.cartaServicio,
    categoriaCarta: opts.categoriaCarta,
    usosComanda: opts.usosComanda,
    precio: precio,
    precioCarta: precio,
    activo: true,
    agotado: false,
    favorito: opts.favorito ?? false,
    orden: opts.orden,
    descripcionCamarero: opts.descripcionCamarero,
    ingredientes: [],
    alergenos: [],
    recomendado: false,
  };
}

function expandirItem(
  prefijo: string,
  item: ItemCarta,
  meta: {
    cartaServicio: CartaServicio;
    categoriaCarta: CategoriaCarta;
    usosComanda: UsoComanda[];
    ordenBase: number;
  },
): ProductoCatalogo[] {
  const desc = descripcionItem(item, meta.categoriaCarta);
  const result: ProductoCatalogo[] = [];
  let orden = meta.ordenBase;

  const push = (nombre: string, precio: number, nombreCorto?: string) => {
    result.push(
      crearProducto(nombre, precio, {
        ...meta,
        nombreCorto,
        descripcionCamarero: desc,
        orden: orden++,
      }),
    );
  };

  if (item.medio !== undefined && item.grande !== undefined) {
    push(`${prefijo} ${item.nombre} (medio)`, item.medio, `${item.nombre} medio`);
    push(`${prefijo} ${item.nombre} (grande)`, item.grande, item.nombre);
    return result;
  }

  if (item.desayuno !== undefined && item.grande !== undefined) {
    push(`Torrada ${item.nombre} (desayuno)`, item.desayuno);
    push(`Torrada ${item.nombre} (grande)`, item.grande, item.nombre);
    return result;
  }

  if (item.precio !== undefined) {
    const nombre =
      meta.categoriaCarta.startsWith("bocadillo") ||
      meta.categoriaCarta === "platosCombinados"
        ? `${prefijo} ${item.nombre}`.trim()
        : item.nombre;
    push(nombre, item.precio);
  }

  return result;
}

function crearDesdeCategorias<
  T extends Record<string, readonly ItemCarta[]>,
>(
  grupos: T,
  usosMap: Record<keyof T, UsoComanda[]>,
  cartaServicio: CartaServicio,
  prefijos?: Partial<Record<keyof T, string>>,
): ProductoCatalogo[] {
  const productos: ProductoCatalogo[] = [];
  let ordenGlobal = 0;

  for (const [categoria, items] of Object.entries(grupos) as [
    keyof T,
    readonly ItemCarta[],
  ][]) {
    const usos = usosMap[categoria];
    const prefijo = prefijos?.[categoria] ?? "";
    for (const item of items) {
      productos.push(
        ...expandirItem(prefijo, item, {
          cartaServicio,
          categoriaCarta: categoria as CategoriaCarta,
          usosComanda: usos,
          ordenBase: (ordenGlobal += 10),
        }),
      );
    }
  }

  return productos;
}

export function crearCatalogoCartas(): ProductoCatalogo[] {
  const almuerzo = crearDesdeCategorias(
    CARTAS_RESTAURANTE.cartaAlmuerzo,
    USO_POR_CATEGORIA_ALMUERZO,
    "almuerzo",
    {
      bocadillosCalientes: "Bocadillo",
      bocadillosFrios: "Bocadillo",
      platosCombinados: "Combinado",
    },
  );

  const cenas = crearDesdeCategorias(
    CARTAS_RESTAURANTE.cartaCenas,
    USO_POR_CATEGORIA_CENAS,
    "cenas",
    { torradas: "Torrada" },
  );

  const vinos = crearDesdeCategorias(
    CARTAS_RESTAURANTE.cartaVinosPostres.vinos,
    USO_POR_CATEGORIA_VINOS,
    "bebidas",
  );

  const bebidasBasicas: ProductoCatalogo[] = [
    crearProducto("Agua", 2, {
      cartaServicio: "bebidas",
      categoriaCarta: "refrescos",
      usosComanda: ["bebidas"],
      favorito: true,
      orden: 9000,
    }),
    crearProducto("Caña", 2.5, {
      cartaServicio: "bebidas",
      categoriaCarta: "refrescos",
      usosComanda: ["bebidas"],
      favorito: true,
      orden: 9010,
    }),
    crearProducto("Refresco", 2.5, {
      cartaServicio: "bebidas",
      categoriaCarta: "refrescos",
      usosComanda: ["bebidas"],
      orden: 9020,
    }),
    crearProducto("Cerveza sin alcohol", 2.5, {
      cartaServicio: "bebidas",
      categoriaCarta: "refrescos",
      usosComanda: ["bebidas"],
      orden: 9030,
    }),
  ];

  const postres = CARTAS_RESTAURANTE.cartaVinosPostres.postres.map(
    (item, i) =>
      crearProducto(item.nombre, item.precio!, {
        cartaServicio: "postres",
        categoriaCarta: "postres",
        usosComanda: ["postres"],
        descripcionCamarero: descripcionItem(item),
        orden: (i + 1) * 10,
      }),
  );

  const operativa: ProductoCatalogo[] = [
    crearProducto("Pan", 0, {
      cartaServicio: "almuerzo",
      categoriaCarta: "extrasSuplementos",
      usosComanda: ["extras"],
      favorito: true,
      orden: 10000,
    }),
    crearProducto("Cubiertos", 0, {
      cartaServicio: "almuerzo",
      categoriaCarta: "extrasSuplementos",
      usosComanda: ["extras"],
      favorito: true,
      orden: 10010,
    }),
    crearProducto("Plato vacío", 0, {
      cartaServicio: "almuerzo",
      categoriaCarta: "extrasSuplementos",
      usosComanda: ["extras"],
      orden: 10020,
    }),
    crearProducto("Servilletas", 0, {
      cartaServicio: "almuerzo",
      categoriaCarta: "extrasSuplementos",
      usosComanda: ["extras"],
      orden: 10030,
    }),
    crearProducto("Hielo", 0, {
      cartaServicio: "almuerzo",
      categoriaCarta: "extrasSuplementos",
      usosComanda: ["extras"],
      favorito: true,
      orden: 10040,
    }),
    crearProducto("Limón", 0, {
      cartaServicio: "almuerzo",
      categoriaCarta: "extrasSuplementos",
      usosComanda: ["extras"],
      orden: 10050,
    }),
  ];

  return [...almuerzo, ...cenas, ...vinos, ...bebidasBasicas, ...postres, ...operativa];
}
