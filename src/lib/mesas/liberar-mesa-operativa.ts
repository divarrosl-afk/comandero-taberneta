import { actualizarEstadoComanda } from "@/lib/comandas/comandas-service";
import { actualizarEstadoPostres } from "@/lib/postres/postres-service";
import { getComandasDeMesa, liberarMesa } from "@/lib/mesas/estado-mesa";
import { isEstadoPanelActivo, normalizeEstadoPanel } from "@/types/panel";

/** Marca cocina/postres activos de la mesa como mesa_libre y libera la mesa. */
export async function liberarMesaOperativa(mesaId: string): Promise<void> {
  const { cocina, postres } = getComandasDeMesa(mesaId);
  const updates: Promise<unknown>[] = [];

  for (const comanda of cocina) {
    if (isEstadoPanelActivo(normalizeEstadoPanel(comanda.estadoPanel))) {
      updates.push(actualizarEstadoComanda(comanda.id, "mesa_libre"));
    }
  }
  for (const comanda of postres) {
    if (isEstadoPanelActivo(normalizeEstadoPanel(comanda.estadoPanel))) {
      updates.push(actualizarEstadoPostres(comanda.id, "mesa_libre"));
    }
  }

  await Promise.all(updates);
  liberarMesa(mesaId);
}
