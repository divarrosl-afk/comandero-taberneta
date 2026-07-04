import { esMismaFecha, esMismaFechaRestaurante } from "@/lib/cierre/fecha";
import { getComandasSync } from "@/lib/comandas/comandas-service";
import { getPostresSync } from "@/lib/postres/postres-service";
import { eliminarComandasLocalesDelDia } from "@/lib/storage/comandas-local";
import { eliminarPostresLocalesDelDia } from "@/lib/storage/postres-local";
import {
  listOutboxEntries,
  removeOutboxForEntity,
} from "@/lib/sync/outbox";
import type { OutboxKind } from "@/lib/sync/outbox-types";
import {
  setComandasCache,
  setPostresCache,
} from "@/lib/sync/operativa-cache";
import { saveOperativaSnapshot } from "@/lib/sync/operativa-snapshot";
import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";

function comandaDelDia(
  creadaEn: string,
  fecha: string,
  usarZonaRestaurante: boolean,
): boolean {
  return usarZonaRestaurante
    ? esMismaFechaRestaurante(creadaEn, fecha)
    : esMismaFecha(creadaEn, fecha);
}

async function purgarOutboxDelDia(fecha: string): Promise<void> {
  const entries = await listOutboxEntries();
  const idsCocina = new Set<string>();
  const idsPostres = new Set<string>();

  for (const entry of entries) {
    if (entry.kind === "cocina_create" || entry.kind === "cocina_estado") {
      const payload = entry.payload as ComandaCocina | { estado?: unknown };
      const creadaEn =
        "creadaEn" in payload && typeof payload.creadaEn === "string"
          ? payload.creadaEn
          : null;
      if (creadaEn && comandaDelDia(creadaEn, fecha, true)) {
        idsCocina.add(entry.entityId);
      }
    }
    if (entry.kind === "postres_create" || entry.kind === "postres_estado") {
      const payload = entry.payload as ComandaPostres | { estado?: unknown };
      const creadaEn =
        "creadaEn" in payload && typeof payload.creadaEn === "string"
          ? payload.creadaEn
          : null;
      if (creadaEn && comandaDelDia(creadaEn, fecha, true)) {
        idsPostres.add(entry.entityId);
      }
    }
  }

  for (const comanda of getComandasSync()) {
    if (comandaDelDia(comanda.creadaEn, fecha, true)) idsCocina.add(comanda.id);
  }
  for (const comanda of getPostresSync()) {
    if (comandaDelDia(comanda.creadaEn, fecha, true)) idsPostres.add(comanda.id);
  }

  const cocinaKinds: OutboxKind[] = ["cocina_create", "cocina_estado"];
  const postresKinds: OutboxKind[] = ["postres_create", "postres_estado"];

  for (const id of idsCocina) {
    await removeOutboxForEntity(cocinaKinds, id);
  }
  for (const id of idsPostres) {
    await removeOutboxForEntity(postresKinds, id);
  }
}

/** Quita del dispositivo todas las comandas/postres del día (caché, IDB, outbox, localStorage). */
export async function purgarOperativaLocalDelDia(fecha: string): Promise<{
  cocina: number;
  postres: number;
}> {
  const cocinaAntes = getComandasSync().filter((c) =>
    comandaDelDia(c.creadaEn, fecha, true),
  );
  const postresAntes = getPostresSync().filter((c) =>
    comandaDelDia(c.creadaEn, fecha, true),
  );

  await purgarOutboxDelDia(fecha);

  const cocinaRestante = getComandasSync().filter(
    (c) => !comandaDelDia(c.creadaEn, fecha, true),
  );
  const postresRestante = getPostresSync().filter(
    (c) => !comandaDelDia(c.creadaEn, fecha, true),
  );

  setComandasCache(cocinaRestante);
  setPostresCache(postresRestante);
  await saveOperativaSnapshot(cocinaRestante, postresRestante);

  eliminarComandasLocalesDelDia(fecha);
  eliminarPostresLocalesDelDia(fecha);

  return {
    cocina: cocinaAntes.length,
    postres: postresAntes.length,
  };
}

export function asegurarDiaFueraDeCache(fecha: string): void {
  const cocina = getComandasSync().filter(
    (c) => !comandaDelDia(c.creadaEn, fecha, true),
  );
  const postres = getPostresSync().filter(
    (c) => !comandaDelDia(c.creadaEn, fecha, true),
  );
  setComandasCache(cocina);
  setPostresCache(postres);
  void saveOperativaSnapshot(cocina, postres);
}
