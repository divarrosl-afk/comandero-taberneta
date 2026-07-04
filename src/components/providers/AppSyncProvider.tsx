"use client";

import { useCallback, useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usesRemoteData } from "@/lib/data/backend";
import { APP_SYNC_POLL_MS } from "@/lib/sync/constants";
import { dispatchAppSync } from "@/lib/sync/app-sync";
import {
  fetchOperativaData,
  resetOperativaInflight,
} from "@/lib/sync/operativa-fetch";
import { hydrateOutboxMirror } from "@/lib/sync/outbox";
import { reconcileOutbox } from "@/lib/sync/reconcile-outbox";
import { flushOutbox } from "@/lib/sync/sync-worker";
import { useSupabaseOperativaRealtime } from "@/hooks/useSupabaseOperativaRealtime";

/**
 * Sincroniza operativa entre dispositivos cada ~10s cuando hay sesión Supabase.
 */
export function AppSyncProvider({ children }: { children: ReactNode }) {
  const { sesion, listo } = useAuth();

  const sincronizar = useCallback(async () => {
    if (!usesRemoteData() || !sesion) return;

    try {
      await hydrateOutboxMirror();
      await reconcileOutbox();
      await flushOutbox();
      await fetchOperativaData();
    } catch (e) {
      console.error("[app-sync] Error al refrescar:", e);
    }

    dispatchAppSync();
  }, [sesion]);

  useEffect(() => {
    if (!usesRemoteData() || !listo || !sesion) return;

    resetOperativaInflight();
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
  }, [listo, sesion, sincronizar]);

  useSupabaseOperativaRealtime(() => {
    if (sesion) void sincronizar();
  });

  return children;
}
