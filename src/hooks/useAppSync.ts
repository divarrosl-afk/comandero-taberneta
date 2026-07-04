"use client";

import { useEffect, useRef } from "react";
import { APP_SYNC_EVENT } from "@/lib/sync/app-sync";

/** Escucha refrescos globales (polling ~10s + Realtime Supabase). */
export function useAppSync(onSync: () => void): void {
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  useEffect(() => {
    const handler = () => {
      onSyncRef.current();
    };
    window.addEventListener(APP_SYNC_EVENT, handler);
    return () => window.removeEventListener(APP_SYNC_EVENT, handler);
  }, []);
}
