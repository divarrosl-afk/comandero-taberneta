"use client";

import { useEffect, useState } from "react";
import { countOutbox, countOutboxSync, hydrateOutboxMirror } from "@/lib/sync/outbox";
import { retryPendingSync } from "@/lib/sync/retry-pending";
import { SYNC_PENDING_POLL_MS } from "@/lib/sync/constants";
import { usesRemoteData } from "@/lib/data/backend";

export function SyncWarningBanner() {
  const [pending, setPending] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [retryMsg, setRetryMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!usesRemoteData()) return;

    const refresh = async () => {
      await hydrateOutboxMirror();
      try {
        const n = await countOutbox();
        setPending(n);
      } catch {
        setPending(countOutboxSync());
      }
    };

    void refresh();
    const interval = setInterval(() => void refresh(), SYNC_PENDING_POLL_MS);
    return () => clearInterval(interval);
  }, []);

  if (!usesRemoteData() || pending === 0) return null;

  const handleRetry = async () => {
    setRetrying(true);
    setRetryMsg(null);
    try {
      const { ok, fail } = await retryPendingSync();
      const remaining = await countOutbox().catch(() => countOutboxSync());
      setPending(remaining);
      if (ok > 0 && fail === 0) {
        setRetryMsg(`${ok} operación(es) sincronizada(s).`);
      } else if (ok > 0) {
        setRetryMsg(`${ok} sincronizada(s), ${fail} aún pendiente(s).`);
      } else {
        setRetryMsg("No se pudo sincronizar. Comprueba la conexión.");
      }
    } finally {
      setRetrying(false);
      setTimeout(() => setRetryMsg(null), 4000);
    }
  };

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950">
      <p>
        Sin conexión a Supabase — {pending} cambio(s) guardados en este
        dispositivo. Se sincronizarán solos al volver Internet.
      </p>
      <button
        type="button"
        onClick={() => void handleRetry()}
        disabled={retrying}
        className="mt-1 font-semibold underline disabled:opacity-60"
      >
        {retrying ? "Reintentando…" : "Reintentar ahora"}
      </button>
      {retryMsg && <p className="mt-1 text-xs">{retryMsg}</p>}
    </div>
  );
}
