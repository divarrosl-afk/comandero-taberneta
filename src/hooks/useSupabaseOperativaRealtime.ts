"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { usesRemoteData } from "@/lib/data/backend";

export function useSupabaseOperativaRealtime(onChange: () => void): void {
  const [restauranteId, setRestauranteId] = useState<string | null>(null);

  useEffect(() => {
    if (!usesRemoteData()) return;
    const env = getSupabaseEnv();
    setRestauranteId(env?.restauranteId ?? null);
  }, []);

  const stableOnChange = useCallback(onChange, [onChange]);

  useEffect(() => {
    if (!usesRemoteData() || !restauranteId) return;

    const client = getSupabaseClient();
    if (!client) return;

    const channel = client
      .channel(`operativa-${restauranteId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comandas_cocina",
          filter: `restaurante_id=eq.${restauranteId}`,
        },
        () => stableOnChange(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comandas_postres",
          filter: `restaurante_id=eq.${restauranteId}`,
        },
        () => stableOnChange(),
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [restauranteId, stableOnChange]);
}
