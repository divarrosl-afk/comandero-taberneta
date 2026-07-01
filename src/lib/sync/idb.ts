import { openDB, type IDBPDatabase } from "idb";
import type { OperativaSnapshot, OutboxEntry } from "@/lib/sync/outbox-types";

const DB_NAME = "comandero-taberneta-sync";
const DB_VERSION = 1;

export type SyncDb = IDBPDatabase<{
  outbox: {
    key: string;
    value: OutboxEntry;
  };
  snapshot: {
    key: string;
    value: OperativaSnapshot;
  };
}>;

let dbPromise: Promise<SyncDb> | null = null;

export function getSyncDb(): Promise<SyncDb> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB no disponible"));
  }

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("outbox")) {
          db.createObjectStore("outbox", { keyPath: "opId" });
        }
        if (!db.objectStoreNames.contains("snapshot")) {
          db.createObjectStore("snapshot", { keyPath: "key" });
        }
      },
    });
  }

  return dbPromise;
}

export function resetSyncDbForTests(): void {
  dbPromise = null;
}
