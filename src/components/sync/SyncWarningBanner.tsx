"use client";

import { useEffect, useState } from "react";
import { countPendingSync } from "@/lib/sync/emergency-local";
import { retryPendingSync } from "@/lib/sync/retry-pending";
import { SYNC_PENDING_POLL_MS } from "@/lib/sync/constants";
import { usesRemoteData } from "@/lib/data/backend";

export function SyncWarningBanner() {
  const [pending, setPending] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [retryMsg, setRetryMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!usesRemoteData()) return;

    const refresh = () => setPending(countPendingSync());
    refresh();
    const interval = setInterval(refresh, SYNC_PENDING_POLL_MS);
    return () => clearInterval(interval);
  }, []);

  if (!usesRemoteData() || pending === 0) return null;

  const handleRetry = async () => {
    setRetrying(true);
    setRetryMsg(null);
    try {
      const { ok, fail } = await retryPendingSync();
      setPending(countPendingSync());
      if (ok > 0 && fail === 0) {
        setRetryMsg(`${ok} comanda(s) sincronizada(s).`);
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
        No se ha podido sincronizar {pending} comanda(s) con Supabase — guardadas
        solo en este dispositivo.
      </p>
      <button
        type="button"
        onClick={() => void handleRetry()}
        disabled={retrying}
        className="mt-1 font-semibold underline disabled:opacity-60"
      >
        {retrying ? "Reintentando…" : "Reintentar sincronización"}
      </button>
      {retryMsg && <p className="mt-1 text-xs">{retryMsg}</p>}
    </div>
  );
}
