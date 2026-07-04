import {
  resolveMesaConfigComanda,
  resolveZonaMesaComanda,
  type MesaComandaRef,
} from "@/lib/mesas/resolve-mesa";
import type { HistorialEntrada } from "@/lib/historial/items";
import type { MesaConfig, ZonaMesa } from "@/types/mesas";
import { ZONAS_PANEL_ORDEN } from "@/types/mesas";

function ordenEntradaEnZona(
  entrada: HistorialEntrada,
  mesas: readonly MesaConfig[],
): number {
  const mesa = resolveMesaConfigComanda(entrada.comanda, mesas);
  return mesa?.orden ?? 999;
}

function codigoEntradaEnZona(
  entrada: HistorialEntrada,
  mesas: readonly MesaConfig[],
): string {
  const mesa = resolveMesaConfigComanda(entrada.comanda, mesas);
  return mesa?.codigo ?? entrada.comanda.mesaCodigo ?? entrada.comanda.mesa;
}

export function agruparHistorialPorZona(
  entradas: HistorialEntrada[],
  mesas: readonly MesaConfig[],
): { zona: ZonaMesa; entradas: HistorialEntrada[] }[] {
  const porZona = new Map<ZonaMesa, HistorialEntrada[]>();

  for (const zona of ZONAS_PANEL_ORDEN) {
    porZona.set(zona, []);
  }

  for (const entrada of entradas) {
    const zona = resolveZonaMesaComanda(entrada.comanda as MesaComandaRef, mesas);
    const lista = porZona.get(zona) ?? [];
    lista.push(entrada);
    porZona.set(zona, lista);
  }

  return ZONAS_PANEL_ORDEN.map((zona) => {
    const lista = (porZona.get(zona) ?? []).slice().sort((a, b) => {
      const hora =
        new Date(b.comanda.creadaEn).getTime() -
        new Date(a.comanda.creadaEn).getTime();
      if (hora !== 0) return hora;
      const ordenDiff =
        ordenEntradaEnZona(a, mesas) - ordenEntradaEnZona(b, mesas);
      if (ordenDiff !== 0) return ordenDiff;
      return codigoEntradaEnZona(a, mesas).localeCompare(
        codigoEntradaEnZona(b, mesas),
        "es",
      );
    });
    return { zona, entradas: lista };
  }).filter((grupo) => grupo.entradas.length > 0);
}
