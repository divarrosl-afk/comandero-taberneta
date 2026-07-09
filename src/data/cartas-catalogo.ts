import { CARTAS_RESTAURANTE, type ItemCarta } from "@/data/cartas-restaurante";
import {
  formatoTorradaCarta,
  formatoTorradaDesayuno,
  rellenoTorrada,
} from "@/lib/carta/torradas-grid";
import { crearProductosCafesCatalogo } from "@/data/cafes-catalogo";
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

function nombreItemCatalogo(
  item: ItemCarta,
  meta: { categoriaCarta: CategoriaCarta },
  prefijo: string,
): string {
  if (
    meta.categoriaCarta.startsWith("bocadillo") ||
    meta.categoriaCarta === "platosCombinados"
  ) {
    return `${prefijo} ${item.nombre}`.trim();
  }
  if (meta.categoriaCarta === "hamburguesas") {
    if (/^hamburguesa\b/i.test(item.nombre)) return item.nombre;
    return `Hamburguesa ${item.nombre}`;
  }
  return item.nombre;
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
    const esBocadillo = meta.categoriaCarta.startsWith("bocadillo");
    if (esBocadillo) {
      push(`1/2 BOC ${item.nombre}`, item.medio);
      push(`BOC ${item.nombre}`, item.grande);
      return result;
    }
    push(`${prefijo} ${item.nombre} (medio)`, item.medio, `${item.nombre} medio`);
    push(`${prefijo} ${item.nombre} (grande)`, item.grande, item.nombre);
    return result;
  }

  if (item.desayuno !== undefined && item.grande !== undefined) {
    const esTorrada = meta.categoriaCarta === "torradas";
    if (esTorrada) {
      const relleno = rellenoTorrada(item.nombre);
      push(formatoTorradaDesayuno(relleno), item.desayuno);
      push(formatoTorradaCarta(relleno), item.grande);
      return result;
    }
    push(`Torrada ${item.nombre} (desayuno)`, item.desayuno);
    push(`Torrada ${item.nombre} (grande)`, item.grande, item.nombre);
    return result;
  }

  if (item.precio !== undefined) {
    const nombre = nombreItemCatalogo(item, meta, prefijo);
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

const REFRESCOS_BEBIDAS = [
  "Coca-Cola normal vidrio",
  "Coca-Cola normal lata",
  "Coca-Cola Zero vidrio",
  "Coca-Cola Zero lata",
  "Vichy",
  "Nestea",
  "Fanta naranja",
  "Fanta limón",
  "Aquarius naranja",
  "Aquarius limón",
  "Schweppes tónica",
  "Schweppes limón",
  "Schweppes naranja",
  "Rockstar",
  "Fanta limón lata",
  "Fanta naranja lata",
  "Aquarius limón lata",
  "Aquarius naranja lata",
  "Zumo natural",
  "Zumo bote melocotón",
  "Zumo bote naranja",
  "Zumo bote piña",
  "Cacaolat",
  "ColaCao",
] as const;

const CERVEZAS_BEBIDAS = [
  "DAMM mediana",
  "Torrada DAMM",
  "0,0 Azul DAMM",
  "Quinto DAMM",
  "Quinto 0,0 Azul",
  "Clara",
  "Clara manual",
  "Caña",
  "Caña pequeña",
  "Zurito",
  "Voll-Damm",
  "Turia",
  "18/70",
  "Copa tinto casa",
  "Copa tinto Rioja",
  "Copa blanco casa",
  "Copa blanco Verdejo",
  "Copa cava casa",
  "Chupito hierbas",
  "Chupito café",
  "Chupito orujo blanco",
  "Chupito hostia",
  "Chupito crema hostia",
  "Chupito crema orujo",
] as const;

export function crearCatalogoCartas(): ProductoCatalogo[] {
  const almuerzo = crearDesdeCategorias(
    CARTAS_RESTAURANTE.cartaAlmuerzo,
    USO_POR_CATEGORIA_ALMUERZO,
    "almuerzo",
    {
      bocadillosCalientes: "Bocadillo",
      bocadillosFrios: "Bocadillo",
      platosCombinados: "Combinado",
      hamburguesas: "Hamburguesa",
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

  const refrescos = bebidasDesdeLista([...REFRESCOS_BEBIDAS], "refrescos", 1000);

  const cervezas = bebidasDesdeLista([...CERVEZAS_BEBIDAS], "cervezas", 2000);

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

  return [
    ...almuerzo,
    ...cenas,
    ...vinos,
    ...refrescos,
    ...cervezas,
    ...postres,
    ...crearProductosCafesCatalogo(),
  ];
}

function bebidasDesdeLista(
  nombres: string[],
  categoria: "refrescos" | "cervezas",
  ordenBase: number,
  precio = 2.5,
): ProductoCatalogo[] {
  return nombres.map((nombre, i) =>
    crearProducto(nombre, precio, {
      cartaServicio: "bebidas",
      categoriaCarta: categoria,
      usosComanda: ["bebidas"],
      orden: ordenBase + i * 10,
    }),
  );
}
