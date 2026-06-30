"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PanelComandaCard } from "@/components/panel/PanelComandaCard";
import { PanelPostresCard } from "@/components/panel/PanelPostresCard";
import { usePanel } from "@/hooks/usePanel";

type PanelTab = "cocina" | "postres";

export function PanelClient() {
  const [tab, setTab] = useState<PanelTab>("cocina");
  const {
    cocinaActivas,
    postresActivas,
    comandasCocina,
    comandasPostres,
    recargar,
    cambiarEstadoCocina,
    cambiarEstadoPostres,
  } = usePanel();

  const listaCocina = tab === "cocina" ? cocinaActivas : [];
  const listaPostres = tab === "postres" ? postresActivas : [];

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-4 py-4">
      <header className="mb-4">
        <Link
          href="/"
          className="mb-2 inline-block text-sm font-semibold text-accent"
        >
          ← Inicio
        </Link>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-primary">Panel cocina/barra</h1>
            <p className="text-sm text-muted">
              {comandasCocina.length} cocina · {comandasPostres.length} postres
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={recargar}>
            Actualizar
          </Button>
        </div>
      </header>

      <nav className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("cocina")}
          className={[
            "flex-1 rounded-xl py-3 text-base font-bold transition active:scale-95",
            tab === "cocina"
              ? "bg-primary text-primary-foreground shadow-md"
              : "border-2 border-border bg-card",
          ].join(" ")}
        >
          Cocina / Barra
          {cocinaActivas.length > 0 && (
            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-sm">
              {cocinaActivas.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("postres")}
          className={[
            "flex-1 rounded-xl py-3 text-base font-bold transition active:scale-95",
            tab === "postres"
              ? "bg-primary text-primary-foreground shadow-md"
              : "border-2 border-border bg-card",
          ].join(" ")}
        >
          Postres
          {postresActivas.length > 0 && (
            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-sm">
              {postresActivas.length}
            </span>
          )}
        </button>
      </nav>

      {tab === "cocina" && (
        <div className="space-y-4">
          {listaCocina.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center text-muted">
              No hay comandas de cocina activas
            </p>
          ) : (
            listaCocina.map((comanda) => (
              <PanelComandaCard
                key={comanda.id}
                comanda={comanda}
                onCambiarEstado={(estado) =>
                  cambiarEstadoCocina(comanda.id, estado)
                }
              />
            ))
          )}
        </div>
      )}

      {tab === "postres" && (
        <div className="space-y-4">
          {listaPostres.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center text-muted">
              No hay comandas de postres activas
            </p>
          ) : (
            listaPostres.map((comanda) => (
              <PanelPostresCard
                key={comanda.id}
                comanda={comanda}
                onCambiarEstado={(estado) =>
                  cambiarEstadoPostres(comanda.id, estado)
                }
              />
            ))
          )}
        </div>
      )}
    </main>
  );
}
