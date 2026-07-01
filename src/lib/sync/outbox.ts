import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";
import type { EstadoPanel } from "@/types/panel";
import { getSyncDb } from "@/lib/sync/idb";
import type { OutboxEntry, OutboxKind } from "@/lib/sync/outbox-types";

const PENDING_COCINA_KEY = "comandero-taberneta:sync-pending-cocina";
const PENDING_POSTRES_KEY = "comandero-taberneta:sync-pending-postres";

/** Espejo síncrono para merge y tests. */
let mirrorCocina: ComandaCocina[] = [];
let mirrorPostres: ComandaPostres[] = [];
let mirrorCount = 0;

function syncMirrorFromEntries(entries: OutboxEntry[]): void {
  mirrorCocina = entries
    .filter((e) => e.kind === "cocina_create")
    .map((e) => e.payload as ComandaCocina);
  mirrorPostres = entries
    .filter((e) => e.kind === "postres_create")
    .map((e) => e.payload as ComandaPostres);
  mirrorCount = entries.length;
}

async function readAllEntries(): Promise<OutboxEntry[]> {
  const db = await getSyncDb();
  return db.getAll("outbox");
}

async function writeEntries(entries: OutboxEntry[]): Promise<void> {
  const db = await getSyncDb();
  const tx = db.transaction("outbox", "readwrite");
  await tx.store.clear();
  for (const entry of entries) {
    await tx.store.put(entry);
  }
  await tx.done;
  syncMirrorFromEntries(entries);
}

function newOpId(): string {
  return crypto.randomUUID();
}

function sortEntries(entries: OutboxEntry[]): OutboxEntry[] {
  return [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export async function listOutboxEntries(): Promise<OutboxEntry[]> {
  return sortEntries(await readAllEntries());
}

export function getOutboxPendingCocinaSync(): ComandaCocina[] {
  return mirrorCocina;
}

export function getOutboxPendingPostresSync(): ComandaPostres[] {
  return mirrorPostres;
}

export function countOutboxSync(): number {
  return mirrorCount;
}

export async function countOutbox(): Promise<number> {
  const entries = await readAllEntries();
  return entries.length;
}

async function findEntry(
  kind: OutboxKind,
  entityId: string,
): Promise<OutboxEntry | undefined> {
  const entries = await readAllEntries();
  return entries.find((e) => e.kind === kind && e.entityId === entityId);
}

async function upsertEntry(entry: OutboxEntry): Promise<void> {
  const entries = await readAllEntries();
  const idx = entries.findIndex((e) => e.opId === entry.opId);
  if (idx >= 0) entries[idx] = entry;
  else entries.push(entry);
  await writeEntries(entries);
}

async function removeEntries(
  predicate: (e: OutboxEntry) => boolean,
): Promise<void> {
  const entries = (await readAllEntries()).filter((e) => !predicate(e));
  await writeEntries(entries);
}

export async function removeOutboxForEntity(
  kinds: OutboxKind[],
  entityId: string,
): Promise<void> {
  await removeEntries(
    (e) => kinds.includes(e.kind) && e.entityId === entityId,
  );
}

export async function enqueueCocinaCreate(comanda: ComandaCocina): Promise<void> {
  const existing = await findEntry("cocina_create", comanda.id);
  const entry: OutboxEntry = existing
    ? { ...existing, payload: comanda }
    : {
        opId: newOpId(),
        kind: "cocina_create",
        entityId: comanda.id,
        payload: comanda,
        createdAt: new Date().toISOString(),
        retries: 0,
      };
  await upsertEntry(entry);
}

export async function enqueuePostresCreate(
  comanda: ComandaPostres,
): Promise<void> {
  const existing = await findEntry("postres_create", comanda.id);
  const entry: OutboxEntry = existing
    ? { ...existing, payload: comanda }
    : {
        opId: newOpId(),
        kind: "postres_create",
        entityId: comanda.id,
        payload: comanda,
        createdAt: new Date().toISOString(),
        retries: 0,
      };
  await upsertEntry(entry);
}

export async function enqueueCocinaEstado(
  entityId: string,
  estado: EstadoPanel,
  comandaFallback?: ComandaCocina,
): Promise<void> {
  const createOp = await findEntry("cocina_create", entityId);
  if (createOp) {
    const comanda = createOp.payload as ComandaCocina;
    await upsertEntry({
      ...createOp,
      payload: { ...comanda, estadoPanel: estado },
    });
    return;
  }

  await removeEntries(
    (e) => e.kind === "cocina_estado" && e.entityId === entityId,
  );

  const entries = await readAllEntries();
  entries.push({
    opId: newOpId(),
    kind: "cocina_estado",
    entityId,
    payload: { estado },
    createdAt: new Date().toISOString(),
    retries: 0,
  });
  await writeEntries(entries);

  if (comandaFallback) {
    mirrorCocina = mirrorCocina.map((c) =>
      c.id === entityId ? { ...c, estadoPanel: estado } : c,
    );
  }
}

export async function enqueuePostresEstado(
  entityId: string,
  estado: EstadoPanel,
): Promise<void> {
  const createOp = await findEntry("postres_create", entityId);
  if (createOp) {
    const comanda = createOp.payload as ComandaPostres;
    await upsertEntry({
      ...createOp,
      payload: { ...comanda, estadoPanel: estado },
    });
    return;
  }

  await removeEntries(
    (e) => e.kind === "postres_estado" && e.entityId === entityId,
  );

  const entries = await readAllEntries();
  entries.push({
    opId: newOpId(),
    kind: "postres_estado",
    entityId,
    payload: { estado },
    createdAt: new Date().toISOString(),
    retries: 0,
  });
  await writeEntries(entries);
}

export async function incrementOutboxRetry(opId: string): Promise<void> {
  const entries = await readAllEntries();
  const idx = entries.findIndex((e) => e.opId === opId);
  if (idx === -1) return;
  entries[idx] = { ...entries[idx], retries: entries[idx].retries + 1 };
  await writeEntries(entries);
}

export async function clearOutbox(): Promise<void> {
  await writeEntries([]);
}

/** Migra cola legacy localStorage → IndexedDB (una vez). */
export async function migrateLegacyPendingQueue(): Promise<void> {
  if (typeof window === "undefined") return;

  const legacyCocina = readLegacy<ComandaCocina>(PENDING_COCINA_KEY);
  const legacyPostres = readLegacy<ComandaPostres>(PENDING_POSTRES_KEY);

  for (const c of legacyCocina) {
    await enqueueCocinaCreate(c);
  }
  for (const p of legacyPostres) {
    await enqueuePostresCreate(p);
  }

  if (legacyCocina.length > 0) {
    localStorage.removeItem(PENDING_COCINA_KEY);
  }
  if (legacyPostres.length > 0) {
    localStorage.removeItem(PENDING_POSTRES_KEY);
  }
}

function readLegacy<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function hydrateOutboxMirror(): Promise<void> {
  try {
    const entries = await readAllEntries();
    syncMirrorFromEntries(entries);
  } catch {
    mirrorCocina = [];
    mirrorPostres = [];
  }
}

export function resetOutboxMirrorForTests(): void {
  mirrorCocina = [];
  mirrorPostres = [];
  mirrorCount = 0;
}
