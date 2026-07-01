import { flushOutbox, type FlushResult } from "@/lib/sync/sync-worker";

export type RetrySyncResult = FlushResult;

/** Reintenta sincronizar la cola outbox (manual o automático). */
export async function retryPendingSync(): Promise<RetrySyncResult> {
  return flushOutbox();
}
