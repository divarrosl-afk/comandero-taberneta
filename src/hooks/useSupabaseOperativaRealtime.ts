"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { usesRemoteData } from "@/lib/data/backend";

export function useSupabaseOperativaRealtime(onChange: () => void): void {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [restauranteId, setRestauranteId] = useState<string | null>(null);

  useEffect(() => {
    if (!usesRemoteData()) return;
    const env = getSupabaseEnv();
    setRestauranteId(env?.restauranteId ?? null);
  }, []);

  const stableHandler = useCallback(() => {
    onChangeRef.current();
  }, []);

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
        stableHandler,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comandas_postres",
          filter: `restaurante_id=eq.${restauranteId}`,
        },
        stableHandler,
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [restauranteId, stableHandler]);
}
