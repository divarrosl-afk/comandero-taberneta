import { normalizarTexto } from "@/lib/catalogo/search";
import { getComandasSync } from "@/lib/comandas/comandas-service";
import { getPostresSync } from "@/lib/postres/postres-service";
import { nombreBoton, type ProductoCatalogo } from "@/types/catalogo";

function acumularNombre(mapa: Map<string, number>, nombre: string, cantidad: number): void {
  const clave = normalizarTexto(nombre);
  if (!clave) return;
  mapa.set(clave, (mapa.get(clave) ?? 0) + cantidad);
}

/** Conteo de ventas por nombre normalizado (historial local del día). */
export function getConteoVentasPorNombre(): Map<string, number> {
  const mapa = new Map<string, number>();

  for (const comanda of getComandasSync()) {
    for (const plato of [
      ...comanda.entrantes,
      ...comanda.primeros,
      ...comanda.segundos,
      ...comanda.bebidas,
    ]) {
      acumularNombre(mapa, plato.nombre, plato.cantidad);
    }
  }

  for (const comanda of getPostresSync()) {
    for (const postre of comanda.postres) {
      acumularNombre(mapa, postre.nombre, postre.cantidad);
    }
  }

  return mapa;
}

function ventasDeNombre(
  producto: ProductoCatalogo,
  conteo: Map<string, number>,
): number {
  const candidatos = [
    producto.nombre,
    producto.nombreCorto,
    nombreBoton(producto),
  ].filter(Boolean) as string[];

  let max = 0;
  for (const [nombre, cantidad] of conteo) {
    for (const c of candidatos) {
      const nc = normalizarTexto(c);
      if (nombre === nc || nombre.includes(nc) || nc.includes(nombre)) {
        max = Math.max(max, cantidad);
      }
    }
  }
  return max;
}

/** Mapa producto.id → unidades vendidas según historial local. */
export function getVentasPorProductoId(
  productos: ProductoCatalogo[],
): Map<string, number> {
  const conteo = getConteoVentasPorNombre();
  const mapa = new Map<string, number>();

  for (const p of productos) {
    const ventas = ventasDeNombre(p, conteo);
    if (ventas > 0) mapa.set(p.id, ventas);
  }

  return mapa;
}

export function hayHistorialVentas(): boolean {
  return getConteoVentasPorNombre().size > 0;
}
