import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";
import { getSyncDb } from "@/lib/sync/idb";
import type { OperativaSnapshot } from "@/lib/sync/outbox-types";

const SNAPSHOT_KEY = "operativa";

export async function saveOperativaSnapshot(
  cocina: ComandaCocina[],
  postres: ComandaPostres[],
): Promise<void> {
  try {
    const db = await getSyncDb();
    const row: OperativaSnapshot = {
      key: SNAPSHOT_KEY,
      cocina,
      postres,
      updatedAt: new Date().toISOString(),
    };
    await db.put("snapshot", row);
  } catch {
    // IndexedDB no disponible (SSR/tests sin polyfill)
  }
}

export async function loadOperativaSnapshot(): Promise<{
  cocina: ComandaCocina[];
  postres: ComandaPostres[];
} | null> {
  try {
    const db = await getSyncDb();
    const row = await db.get("snapshot", SNAPSHOT_KEY);
    if (!row) return null;
    return { cocina: row.cocina, postres: row.postres };
  } catch {
    return null;
  }
}
