"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppSync } from "@/hooks/useAppSync";
import {
  getHistorialEntradas,
  type HistorialEntrada,
} from "@/lib/historial/items";
import { eliminarComanda } from "@/lib/comandas/comandas-service";
import { eliminarPostres } from "@/lib/postres/postres-service";
import { fetchOperativaData } from "@/lib/sync/operativa-fetch";
import { usesRemoteData } from "@/lib/data/backend";
import { reimprimirEntrada } from "@/modules/impresion-wifi";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi";

export function useHistorial() {
  const [entradas, setEntradas] = useState<HistorialEntrada[]>([]);
  const [reimpresionMsg, setReimpresionMsg] = useState<string | null>(null);
  const [reimpresionError, setReimpresionError] = useState(false);

  const recargar = useCallback(async () => {
    if (usesRemoteData()) {
      try {
        await fetchOperativaData();
      } catch (e) {
        console.error("[historial] Error al cargar operativa:", e);
      }
    }
    setEntradas(getHistorialEntradas());
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  useAppSync(() => {
    void recargar();
  });

  const eliminar = useCallback(
    async (entrada: HistorialEntrada) => {
      const ok =
        entrada.tipo === "cocina"
          ? await eliminarComanda(entrada.comanda.id)
          : await eliminarPostres(entrada.comanda.id);

      if (ok) await recargar();
      return ok;
    },
    [recargar],
  );

  const reimprimir = useCallback(async (entrada: HistorialEntrada) => {
    setReimpresionMsg("Enviando a impresora...");
    setReimpresionError(false);

    try {
      const batch = await reimprimirEntrada(entrada);

      setReimpresionMsg(batch.summary);
      setReimpresionError(!batch.allOk);
    } catch {
      setReimpresionMsg(PRINT_MESSAGES.error);
      setReimpresionError(true);
    }

    setTimeout(() => setReimpresionMsg(null), 4000);
  }, []);

  return {
    entradas,
    recargar,
    eliminar,
    reimprimir,
    reimpresionMsg,
    reimpresionError,
  };
}
