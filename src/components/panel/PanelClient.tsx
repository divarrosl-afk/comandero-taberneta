"use client";

import Link from "next/link";
import { useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/Button";
import { PanelComandaCard } from "@/components/panel/PanelComandaCard";
import { PanelComandaTile } from "@/components/panel/PanelComandaTile";
import { PanelDetalleSheet } from "@/components/panel/PanelDetalleSheet";
import { PanelPostresCard } from "@/components/panel/PanelPostresCard";
import { PanelPostresTile } from "@/components/panel/PanelPostresTile";
import { comandaPerteneceAMesa } from "@/lib/mesas/resolve-mesa";
import { useMesas } from "@/hooks/useMesas";
import { usePanel } from "@/hooks/usePanel";
import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";

type PanelTab = "cocina" | "postres";

export function PanelClient() {
  const [tab, setTab] = useState<PanelTab>("cocina");
  const [detalleCocina, setDetalleCocina] = useState<ComandaCocina | null>(
    null,
  );
  const [detallePostres, setDetallePostres] = useState<ComandaPostres | null>(
    null,
  );
  const { mesas } = useMesas();
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

  const postresDeMesa = (comanda: ComandaCocina) =>
    comandasPostres.find(
      (p) =>
        comandaPerteneceAMesa(p, comanda.mesa) &&
        p.estadoPanel !== "mesa_libre",
    );

  return (
    <RequireAuth>
      <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-3 py-3 sm:px-4">
        <header className="mb-3 shrink-0">
          <Link
            href="/"
            className="mb-2 inline-block text-sm font-semibold text-accent"
          >
            ← Inicio
          </Link>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-primary sm:text-2xl">
                Panel cocina/barra
              </h1>
              <p className="text-sm text-muted">
                {comandasCocina.length} cocina · {comandasPostres.length}{" "}
                postres
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={recargar}>
              Actualizar
            </Button>
          </div>
        </header>

        <nav className="mb-3 flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setTab("cocina")}
            className={[
              "flex-1 rounded-xl py-2.5 text-sm font-bold transition active:scale-95 sm:text-base",
              tab === "cocina"
                ? "bg-primary text-primary-foreground shadow-md"
                : "border-2 border-border bg-card",
            ].join(" ")}
          >
            Cocina / Barra
            {cocinaActivas.length > 0 && (
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs sm:text-sm">
                {cocinaActivas.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("postres")}
            className={[
              "flex-1 rounded-xl py-2.5 text-sm font-bold transition active:scale-95 sm:text-base",
              tab === "postres"
                ? "bg-primary text-primary-foreground shadow-md"
                : "border-2 border-border bg-card",
            ].join(" ")}
          >
            Postres
            {postresActivas.length > 0 && (
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs sm:text-sm">
                {postresActivas.length}
              </span>
            )}
          </button>
        </nav>

        {tab === "cocina" && (
          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            {listaCocina.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center text-muted">
                No hay comandas de cocina activas
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {listaCocina.map((comanda) => (
                  <PanelComandaTile
                    key={comanda.id}
                    comanda={comanda}
                    mesas={mesas}
                    postresMesa={postresDeMesa(comanda)}
                    onClick={() => setDetalleCocina(comanda)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "postres" && (
          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            {listaPostres.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center text-muted">
                No hay comandas de postres activas
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {listaPostres.map((comanda) => (
                  <PanelPostresTile
                    key={comanda.id}
                    comanda={comanda}
                    mesas={mesas}
                    onClick={() => setDetallePostres(comanda)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <PanelDetalleSheet
          open={detalleCocina !== null}
          onClose={() => setDetalleCocina(null)}
        >
          {detalleCocina && (
            <PanelComandaCard
              comanda={detalleCocina}
              mesas={mesas}
              postresMesa={postresDeMesa(detalleCocina)}
              onCambiarEstado={async (estado) => {
                await cambiarEstadoCocina(detalleCocina.id, estado);
                setDetalleCocina({ ...detalleCocina, estadoPanel: estado });
              }}
            />
          )}
        </PanelDetalleSheet>

        <PanelDetalleSheet
          open={detallePostres !== null}
          onClose={() => setDetallePostres(null)}
        >
          {detallePostres && (
            <PanelPostresCard
              comanda={detallePostres}
              mesas={mesas}
              onCambiarEstado={async (estado) => {
                await cambiarEstadoPostres(detallePostres.id, estado);
                setDetallePostres({ ...detallePostres, estadoPanel: estado });
              }}
            />
          )}
        </PanelDetalleSheet>
      </main>
    </RequireAuth>
  );
}
