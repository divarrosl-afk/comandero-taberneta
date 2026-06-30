"use client";

import { useCallback, useEffect, useState } from "react";
import {
  entradaToTicket,
  getHistorialEntradas,
  type HistorialEntrada,
} from "@/lib/historial/items";
import { eliminarComandaLocal } from "@/lib/storage/comandas-local";
import { eliminarPostresLocal } from "@/lib/storage/postres-local";

export function useHistorial() {
  const [entradas, setEntradas] = useState<HistorialEntrada[]>([]);
  const [reimpresionMsg, setReimpresionMsg] = useState<string | null>(null);

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

  const reimprimir = useCallback((entrada: HistorialEntrada) => {
    const ticket = entradaToTicket(entrada);
    console.info("[REIMPRESIÓN SIMULADA]", ticket);
    setReimpresionMsg(
      `Ticket MESA ${entrada.comanda.mesa} enviado a impresora (simulado)`,
    );
    setTimeout(() => setReimpresionMsg(null), 3000);
  }, []);

  return {
    entradas,
    recargar,
    eliminar,
    reimprimir,
    reimpresionMsg,
  };
}
