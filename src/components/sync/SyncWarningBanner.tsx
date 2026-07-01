"use client";

import { useEffect, useState } from "react";
import { countPendingSync } from "@/lib/sync/emergency-local";
import { usesRemoteData } from "@/lib/data/backend";

export function SyncWarningBanner() {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (!usesRemoteData()) return;

    const refresh = () => setPending(countPendingSync());
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!usesRemoteData() || pending === 0) return null;

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-950">
      No se ha podido sincronizar {pending} comanda(s) con Supabase — guardadas
      localmente en este dispositivo.
    </div>
  );
}
