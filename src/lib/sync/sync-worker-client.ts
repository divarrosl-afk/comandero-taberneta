import { usesRemoteData } from "@/lib/data/backend";
import { SYNC_FLUSH_MS } from "@/lib/sync/constants";
import {
  hydrateOutboxMirror,
  migrateLegacyPendingQueue,
} from "@/lib/sync/outbox";
import { flushOutbox } from "@/lib/sync/sync-worker";

let started = false;
let intervalId: ReturnType<typeof setInterval> | null = null;

export async function initOfflineSync(): Promise<void> {
  if (!usesRemoteData() || typeof window === "undefined") return;

  await migrateLegacyPendingQueue();
  await hydrateOutboxMirror();
  await flushOutbox();
}

export function startOfflineSyncWorker(): void {
  if (!usesRemoteData() || typeof window === "undefined" || started) return;
  started = true;

  void initOfflineSync();

  const onOnline = () => {
    void flushOutbox();
  };
  window.addEventListener("online", onOnline);

  intervalId = setInterval(() => {
    void flushOutbox();
  }, SYNC_FLUSH_MS);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void flushOutbox();
    }
  });
}

export function stopOfflineSyncWorkerForTests(): void {
  started = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
