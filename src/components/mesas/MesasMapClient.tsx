"use client";

import Link from "next/link";
import { useEffect } from "react";
import { MesaCard } from "@/components/mesas/MesaCard";
import { Button } from "@/components/ui/Button";
import { CamareroAccesosBar } from "@/components/navigation/CamareroAccesosBar";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useMesasOperativas } from "@/hooks/useMesas";
import { liberarMesaOperativa } from "@/lib/mesas/liberar-mesa-operativa";
import {
  toggleMesaCobrando,
} from "@/lib/mesas/estado-mesa";
import { usesRemoteData } from "@/lib/data/backend";
import { fetchOperativaData } from "@/lib/sync/operativa-fetch";
import { labelZona, ZONAS_MESA } from "@/types/mesas";

export function MesasMapClient() {
  const { operativas, refrescar, porZona, cargando, operativaRevision } =
    useMesasOperativas();

  useEffect(() => {
    if (!usesRemoteData()) return;
    void fetchOperativaData().then(() => refrescar());
  }, [refrescar]);

  return (
    <RequireAuth>
      <main className="mx-auto min-h-dvh max-w-2xl px-4 py-4 pb-8">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              href="/"
              className="mb-2 inline-block text-sm font-semibold text-accent"
            >
              ← Inicio
            </Link>
            <h1 className="text-2xl font-bold text-primary">Mesas</h1>
            <p className="text-sm text-muted">
              {operativas.length} mesas activas · La Taberneta
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refrescar}>
            Actualizar
          </Button>
        </header>

        <CamareroAccesosBar activo="mes" className="mb-4" />

        <div className="mb-6 flex flex-wrap gap-2 text-xs">
          {ZONAS_MESA.map((z) => (
            <span key={z.id} className="rounded-full border border-border px-2 py-1">
              {z.label}: {porZona(z.id).length}
            </span>
          ))}
        </div>

        <div className="space-y-8">
          {cargando && (
            <p className="text-center text-sm text-muted">Cargando mesas…</p>
          )}
          {!cargando && operativas.length === 0 && (
            <p className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-6 text-center text-sm text-amber-900">
              No hay mesas en Supabase. Pulsa <strong>Actualizar</strong> o ve a
              Configuración → Mesas → Restaurar distribución por defecto.
            </p>
          )}
          {ZONAS_MESA.map((zona) => {
            const lista = porZona(zona.id);
            if (lista.length === 0) return null;
            return (
              <section key={zona.id}>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
                  {labelZona(zona.id)}
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {lista.map((mesa) => (
                    <MesaCard
                      key={mesa.id}
                      mesa={mesa}
                      operativaRevision={operativaRevision}
                      onToggleCobrando={() => {
                        toggleMesaCobrando(mesa.id);
                        refrescar();
                      }}
                      onLiberar={() => {
                        void liberarMesaOperativa(mesa.id).then(() => refrescar());
                      }}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </RequireAuth>
  );
}
