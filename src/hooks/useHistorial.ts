"use client";

import { useCallback, useEffect, useState } from "react";
import {
  entradaToTicket,
  getHistorialEntradas,
  type HistorialEntrada,
} from "@/lib/historial/items";
import { eliminarComandaLocal } from "@/lib/storage/comandas-local";
import { eliminarPostresLocal } from "@/lib/storage/postres-local";
import {
  destinoDesdeHistorial,
  reimprimirTicket,
} from "@/modules/impresion-wifi";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi";

export function useHistorial() {
  const [entradas, setEntradas] = useState<HistorialEntrada[]>([]);
  const [reimpresionMsg, setReimpresionMsg] = useState<string | null>(null);
  const [reimpresionError, setReimpresionError] = useState(false);

  const recargar = useCallback(() => {
    setEntradas(getHistorialEntradas());
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const eliminar = useCallback(
    (entrada: HistorialEntrada) => {
      const ok =
        entrada.tipo === "cocina"
          ? eliminarComandaLocal(entrada.comanda.id)
          : eliminarPostresLocal(entrada.comanda.id);

      if (ok) recargar();
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
