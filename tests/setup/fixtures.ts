import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";
import type { ProductoCatalogo } from "@/types/catalogo";
import { hoyFecha } from "@/lib/cierre/fecha";

export const FECHA_HOY = hoyFecha();

export function comandaCocinaFixture(
  overrides: Partial<ComandaCocina> = {},
): ComandaCocina {
  return {
    id: overrides.id ?? "cmd-test-001",
    mesa: "C1",
    camarero: "david",
    tipoServicio: "carta",
    entrantes: [],
    primeros: [
      {
        id: "plato-1",
        nombre: "Ensalada",
        cantidad: 2,
        modificaciones: [],
        salsas: [],
        estado: "pendiente",
      },
    ],
    segundos: [],
    bebidas: [
      {
        id: "beb-1",
        nombre: "Agua",
        cantidad: 1,
        modificaciones: [],
        salsas: [],
        estado: "pendiente",
      },
    ],
    extras: [],
    observaciones: [],
    creadaEn: `${FECHA_HOY}T12:00:00.000Z`,
    enviada: true,
    estadoPanel: "sentados",
    ...overrides,
  };
}

export function comandaPostresFixture(
  overrides: Partial<ComandaPostres> = {},
): ComandaPostres {
  return {
    id: overrides.id ?? "pst-test-001",
    mesa: "C1",
    camarero: "ingrid",
    postres: [{ id: "d1", nombre: "Flan", cantidad: 1 }],
    cafes: [],
    estadoX: "pendiente",
    estadoXCafe: null,
    clH: false,
    observaciones: [],
    creadaEn: `${FECHA_HOY}T13:00:00.000Z`,
    enviada: true,
    estadoPanel: "sentados",
    ...overrides,
  };
}

export function productoCatalogoFixture(
  overrides: Partial<ProductoCatalogo> = {},
): ProductoCatalogo {
  return {
    id: "prod-1",
    nombre: "Bacalao",
    seccion: "primeros",
    tipo: "carta",
    activo: true,
    agotado: false,
    favorito: true,
    recomendado: false,
    orden: 1,
    ingredientes: [],
    alergenos: [],
    ...overrides,
  };
}
