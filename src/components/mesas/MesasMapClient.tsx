"use client";

import Link from "next/link";
import { MesaCard } from "@/components/mesas/MesaCard";
import { Button } from "@/components/ui/Button";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useMesasOperativas } from "@/hooks/useMesas";
import {
  liberarMesa,
  marcarMesaCobrando,
} from "@/lib/mesas/estado-mesa";
import { labelZona, ZONAS_MESA } from "@/types/mesas";

export function MesasMapClient() {
  const { operativas, refrescar, porZona } = useMesasOperativas();

  return (
    <RequireAuth>
      <main className="mx-auto min-h-dvh max-w-2xl px-4 py-4 pb-8">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
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

        <div className="mb-6 flex flex-wrap gap-2 text-xs">
          {ZONAS_MESA.map((z) => (
            <span key={z.id} className="rounded-full border border-border px-2 py-1">
              {z.label}: {porZona(z.id).length}
            </span>
          ))}
        </div>

        <div className="space-y-8">
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
                      onCobrando={() => {
                        marcarMesaCobrando(mesa.id);
                        refrescar();
                      }}
                      onLiberar={() => {
                        liberarMesa(mesa.id);
                        refrescar();
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
