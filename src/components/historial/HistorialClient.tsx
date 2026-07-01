"use client";

import Link from "next/link";
import { useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/Button";
import { HistorialCard } from "@/components/historial/HistorialCard";
import { useAuth } from "@/contexts/AuthContext";
import { useHistorial } from "@/hooks/useHistorial";
import type { HistorialTipo } from "@/types/panel";

type FiltroTipo = "todos" | HistorialTipo;

export function HistorialClient() {
  const { puedeBorrarHistorial } = useAuth();
  const { entradas, recargar, eliminar, reimprimir, reimpresionMsg, reimpresionError } =
    useHistorial();
  const [filtro, setFiltro] = useState<FiltroTipo>("todos");

  const filtradas =
    filtro === "todos"
      ? entradas
      : entradas.filter((e) => e.tipo === filtro);

  return (
    <RequireAuth>
      <main className="mx-auto min-h-dvh max-w-lg px-4 py-4">
      <header className="mb-4">
        <Link
          href="/"
          className="mb-2 inline-block text-sm font-semibold text-accent"
        >
          ← Inicio
        </Link>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-primary">Historial</h1>
            <p className="text-sm text-muted">{entradas.length} comandas guardadas</p>
          </div>
          <Button variant="outline" size="sm" onClick={recargar}>
            Actualizar
          </Button>
        </div>
      </header>

      {reimpresionMsg && (
        <div
          className={[
            "mb-4 rounded-xl border px-4 py-3 text-sm font-medium",
            reimpresionError
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-green-200 bg-green-50 text-green-800",
          ].join(" ")}
        >
          {reimpresionMsg}
        </div>
      )}

      <div className="mb-4 flex gap-2">
        {(
          [
            { id: "todos" as const, label: "Todos" },
            { id: "cocina" as const, label: "Cocina" },
            { id: "postres" as const, label: "Postres" },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFiltro(f.id)}
            className={[
              "flex-1 rounded-xl py-2.5 text-sm font-bold transition active:scale-95",
              filtro === f.id
                ? "bg-primary text-primary-foreground"
                : "border-2 border-border bg-card",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center text-muted">
          No hay comandas en el historial.
          <br />
          <span className="text-sm">Envía una comanda desde el comandero.</span>
        </p>
      ) : (
        <div className="space-y-3">
          {filtradas.map((entrada) => (
            <HistorialCard
              key={`${entrada.tipo}-${entrada.comanda.id}`}
              entrada={entrada}
              onReimprimir={() => reimprimir(entrada)}
              onEliminar={() => eliminar(entrada)}
              puedeEliminar={puedeBorrarHistorial}
            />
          ))}
        </div>
      )}
      </main>
    </RequireAuth>
  );
}
