"use client";

import { useEffect, type ReactNode } from "react";
import { startOfflineSyncWorker } from "@/lib/sync/sync-worker-client";

export function SyncWorkerProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    startOfflineSyncWorker();
  }, []);

  return children;
}
