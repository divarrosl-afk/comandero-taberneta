"use client";

import { useCallback, useEffect, type ReactNode } from "react";
import { usesRemoteData } from "@/lib/data/backend";
import { APP_SYNC_POLL_MS } from "@/lib/sync/constants";
import { dispatchAppSync } from "@/lib/sync/app-sync";
import { fetchOperativaData } from "@/lib/sync/operativa-fetch";
import { hydrateOutboxMirror } from "@/lib/sync/outbox";
import { reconcileOutbox } from "@/lib/sync/reconcile-outbox";
import { flushOutbox } from "@/lib/sync/sync-worker";
import { useSupabaseOperativaRealtime } from "@/hooks/useSupabaseOperativaRealtime";

/**
 * Sincroniza operativa, mesas y menú entre dispositivos cada ~10s
 * y ante cambios Realtime en Supabase.
 */
export function AppSyncProvider({ children }: { children: ReactNode }) {
  const sincronizar = useCallback(async () => {
    if (!usesRemoteData()) return;

    try {
      await hydrateOutboxMirror();
      await reconcileOutbox();
      await flushOutbox();
      await fetchOperativaData();
    } catch (e) {
      console.error("[app-sync] Error al refrescar:", e);
    }

    dispatchAppSync();
  }, []);

  useEffect(() => {
    if (!usesRemoteData()) return;

    void sincronizar();
    const interval = setInterval(() => void sincronizar(), APP_SYNC_POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void sincronizar();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [sincronizar]);

  useSupabaseOperativaRealtime(() => {
    void sincronizar();
  });

  return children;
}
