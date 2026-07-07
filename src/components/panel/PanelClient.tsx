"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/Button";
import { PanelComandaCard } from "@/components/panel/PanelComandaCard";
import { PanelComandaTile } from "@/components/panel/PanelComandaTile";
import { PanelDetalleSheet } from "@/components/panel/PanelDetalleSheet";
import { PanelPostresCard } from "@/components/panel/PanelPostresCard";
import { PanelPostresTile } from "@/components/panel/PanelPostresTile";
import { PanelCocinaTicketRails } from "@/components/panel/PanelCocinaTicketRails";
import { liberarMesaSiSinComandasActivas } from "@/lib/mesas/estado-mesa";
import { comandaPerteneceAMesa } from "@/lib/mesas/resolve-mesa";
import type { EstadoPanel } from "@/types/panel";
import { ordenarComandasPorLlegada, minutosEspera } from "@/lib/panel/orden-tickets-cocina";
import { useMesas } from "@/hooks/useMesas";
import { usePanel } from "@/hooks/usePanel";
import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";

type PanelTab = "cocina" | "postres";

function PanelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mesaFiltro = searchParams.get("mesa");
  const tabParam = searchParams.get("tab");
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

  const aplicarMesaLibre = (mesaId: string) => {
    liberarMesaSiSinComandasActivas(mesaId);
  };

  const handleCambiarEstadoCocina = async (
    comanda: ComandaCocina,
    estado: EstadoPanel,
  ) => {
    await cambiarEstadoCocina(comanda.id, estado);
    if (estado === "mesa_libre") {
      aplicarMesaLibre(comanda.mesa);
      setDetalleCocina(null);
      router.push("/mesas");
      return;
    }
    setDetalleCocina({ ...comanda, estadoPanel: estado });
  };

  const handleCambiarEstadoPostres = async (
    comanda: ComandaPostres,
    estado: EstadoPanel,
  ) => {
    await cambiarEstadoPostres(comanda.id, estado);
    if (estado === "mesa_libre") {
      aplicarMesaLibre(comanda.mesa);
      setDetallePostres(null);
      router.push("/mesas");
      return;
    }
    setDetallePostres({ ...comanda, estadoPanel: estado });
  };

  const handleMarcarMesaLibreCocina = async (comanda: ComandaCocina) => {
    await cambiarEstadoCocina(comanda.id, "mesa_libre");
    aplicarMesaLibre(comanda.mesa);
    setDetalleCocina(null);
  };

  const handleMarcarMesaLibrePostres = async (comanda: ComandaPostres) => {
    await cambiarEstadoPostres(comanda.id, "mesa_libre");
    aplicarMesaLibre(comanda.mesa);
    setDetallePostres(null);
  };

  const listaCocina = tab === "cocina" ? cocinaActivas : [];
  const listaPostres = tab === "postres" ? postresActivas : [];
  const cocinaVisibles = mesaFiltro
    ? listaCocina.filter((c) => comandaPerteneceAMesa(c, mesaFiltro))
    : listaCocina;
  const mesaAbiertaRef = useRef<string | null>(null);

  useEffect(() => {
    if (tabParam === "postres") setTab("postres");
    else if (tabParam === "cocina") setTab("cocina");
  }, [tabParam]);

  useEffect(() => {
    if (!mesaFiltro) {
      mesaAbiertaRef.current = null;
      return;
    }
    if (mesaAbiertaRef.current === mesaFiltro) return;
    const comanda = cocinaActivas.find((c) =>
      comandaPerteneceAMesa(c, mesaFiltro),
    );
    if (comanda) {
      setDetalleCocina(comanda);
      mesaAbiertaRef.current = mesaFiltro;
    }
  }, [mesaFiltro, cocinaActivas]);

  const postresDeMesa = (comanda: ComandaCocina) =>
    comandasPostres.find(
      (p) =>
        comandaPerteneceAMesa(p, comanda.mesa) &&
        p.estadoPanel !== "mesa_libre",
    );

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-3 py-3 sm:px-4">
      <header className="mb-3 shrink-0">
        <Link
          href={mesaFiltro ? "/mesas" : "/"}
          className="mb-2 inline-block text-sm font-semibold text-accent"
        >
          ← {mesaFiltro ? "Mesas" : "Inicio"}
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
          <>
            {cocinaVisibles.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center text-muted">
                {mesaFiltro
                  ? "No hay comanda de cocina activa en esta mesa"
                  : "No hay comandas de cocina activas"}
              </p>
            ) : mesaFiltro ? (
              <div className="min-h-0 flex-1 overflow-y-auto pb-4">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {ordenarComandasPorLlegada(cocinaVisibles).map((comanda) => (
                    <div
                      key={comanda.id}
                      className="w-[9.5rem] shrink-0 sm:w-[10.5rem]"
                    >
                      <PanelComandaTile
                        comanda={comanda}
                        mesas={mesas}
                        postresMesa={postresDeMesa(comanda)}
                        onClick={() => setDetalleCocina(comanda)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <PanelCocinaTicketRails
                comandas={cocinaVisibles}
                mesas={mesas}
                postresDeMesa={postresDeMesa}
                onAbrir={setDetalleCocina}
              />
            )}
          </>
        )}

        {tab === "postres" && (
          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            {listaPostres.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center text-muted">
                No hay comandas de postres activas
              </p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {ordenarComandasPorLlegada(listaPostres).map((comanda, index) => (
                  <div
                    key={comanda.id}
                    className="w-[9.5rem] shrink-0 sm:w-[10.5rem]"
                  >
                    <p className="mb-1 text-[10px] font-bold text-muted">
                      #{index + 1} ·{" "}
                      {minutosEspera(comanda.creadaEn) < 1
                        ? "<1 min"
                        : `${minutosEspera(comanda.creadaEn)} min`}
                    </p>
                    <PanelPostresTile
                      comanda={comanda}
                      mesas={mesas}
                      onClick={() => setDetallePostres(comanda)}
                    />
                  </div>
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
              onCambiarEstado={(estado) =>
                handleCambiarEstadoCocina(detalleCocina, estado)
              }
              onEliminar={() => handleMarcarMesaLibreCocina(detalleCocina)}
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
              onCambiarEstado={(estado) =>
                handleCambiarEstadoPostres(detallePostres, estado)
              }
              onEliminar={() => handleMarcarMesaLibrePostres(detallePostres)}
            />
          )}
        </PanelDetalleSheet>
      </main>
  );
}

export function PanelClient() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <main className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4">
            <p className="text-muted">Cargando panel…</p>
          </main>
        }
      >
        <PanelContent />
      </Suspense>
    </RequireAuth>
  );
}
