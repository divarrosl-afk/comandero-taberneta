"use client";

import { useCallback, useEffect, useState } from "react";
import {
  entradaToTicket,
  getHistorialEntradas,
  type HistorialEntrada,
} from "@/lib/historial/items";
import { eliminarComanda, fetchComandas } from "@/lib/comandas/comandas-service";
import { eliminarPostres, fetchPostres } from "@/lib/postres/postres-service";
import { usesRemoteData } from "@/lib/data/backend";
import {
  destinoDesdeHistorial,
  reimprimirTicket,
} from "@/modules/impresion-wifi";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi";

export function useHistorial() {
  const [entradas, setEntradas] = useState<HistorialEntrada[]>([]);
  const [reimpresionMsg, setReimpresionMsg] = useState<string | null>(null);
  const [reimpresionError, setReimpresionError] = useState(false);

  const recargar = useCallback(async () => {
    if (usesRemoteData()) {
      await Promise.all([fetchComandas(), fetchPostres()]);
    }
    setEntradas(getHistorialEntradas());
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

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
      const ticket = entradaToTicket(entrada);
      const destino = destinoDesdeHistorial(entrada.tipo);
      const batch = await reimprimirTicket(ticket, destino, {
        comandaId: entrada.comanda.id,
        mesa: entrada.comanda.mesa,
        camarero: entrada.comanda.camarero,
      });

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
