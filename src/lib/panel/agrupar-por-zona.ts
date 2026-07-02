import {
  resolveMesaConfigComanda,
  resolveZonaMesaComanda,
  type MesaComandaRef,
} from "@/lib/mesas/resolve-mesa";
import type { MesaConfig, ZonaMesa } from "@/types/mesas";
import { ZONAS_PANEL_ORDEN } from "@/types/mesas";

function ordenComandaEnZona(
  comanda: MesaComandaRef,
  mesas: readonly MesaConfig[],
): number {
  const mesa = resolveMesaConfigComanda(comanda, mesas);
  return mesa?.orden ?? 999;
}

function codigoComandaEnZona(
  comanda: MesaComandaRef,
  mesas: readonly MesaConfig[],
): string {
  const mesa = resolveMesaConfigComanda(comanda, mesas);
  return mesa?.codigo ?? comanda.mesaCodigo ?? comanda.mesa;
}

export function agruparComandasPorZona<T extends MesaComandaRef>(
  comandas: T[],
  mesas: readonly MesaConfig[],
): { zona: ZonaMesa; comandas: T[] }[] {
  const porZona = new Map<ZonaMesa, T[]>();

  for (const zona of ZONAS_PANEL_ORDEN) {
    porZona.set(zona, []);
  }

  for (const comanda of comandas) {
    const zona = resolveZonaMesaComanda(comanda, mesas);
    const lista = porZona.get(zona) ?? [];
    lista.push(comanda);
    porZona.set(zona, lista);
  }

  return ZONAS_PANEL_ORDEN.map((zona) => {
    const lista = (porZona.get(zona) ?? []).slice().sort((a, b) => {
      const ordenDiff =
        ordenComandaEnZona(a, mesas) - ordenComandaEnZona(b, mesas);
      if (ordenDiff !== 0) return ordenDiff;
      return codigoComandaEnZona(a, mesas).localeCompare(
        codigoComandaEnZona(b, mesas),
        "es",
      );
    });
    return { zona, comandas: lista };
  }).filter((grupo) => grupo.comandas.length > 0);
}
