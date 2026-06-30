"use client";

import Link from "next/link";
import { useState } from "react";
import { MesaEditor } from "@/components/configuracion/MesaEditor";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useMesas } from "@/hooks/useMesas";
import {
  labelZona,
  ZONAS_MESA,
  type MesaConfig,
  type ZonaMesa,
} from "@/types/mesas";

const mesaVacia = (zona: ZonaMesa): MesaConfig => ({
  id: "",
  codigo: "",
  nombreVisible: "",
  zona,
  activa: true,
  orden: 0,
  permiteVarianteB: false,
  esVarianteB: false,
});

export function MesasConfigClient() {
  const { mesas, actualizar, crear, restaurarDefault } = useMesas();
  const [zona, setZona] = useState<ZonaMesa>("comedor");
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const lista = mesas
    .filter((m) => m.zona === zona)
    .sort((a, b) => a.orden - b.orden || a.codigo.localeCompare(b.codigo, "es"));

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-4 pb-8">
      <header className="mb-4">
        <Link
          href="/"
          className="mb-2 inline-block text-sm font-semibold text-accent"
        >
          ← Inicio
        </Link>
        <h1 className="text-2xl font-bold text-primary">Configurar mesas</h1>
        <p className="mt-1 text-sm text-muted">
          {mesas.length} mesas · zonas La Taberneta
        </p>
      </header>

      <nav className="mb-4 flex gap-1 overflow-x-auto pb-1">
        {ZONAS_MESA.map((z) => (
          <button
            key={z.id}
            type="button"
            onClick={() => {
              setZona(z.id);
              setEditando(null);
              setNuevo(false);
            }}
            className={[
              "shrink-0 rounded-xl px-3 py-2 text-sm font-bold",
              zona === z.id
                ? "bg-primary text-primary-foreground"
                : "bg-card",
            ].join(" ")}
          >
            {z.label}
          </button>
        ))}
      </nav>

      <Button
        variant="outline"
        fullWidth
        className="mb-4"
        onClick={() => {
          setNuevo(true);
          setEditando(null);
        }}
      >
        + Nueva mesa en {labelZona(zona)}
      </Button>

      {nuevo && (
        <div className="mb-4">
          <MesaEditor
            mesa={mesaVacia(zona)}
            esNuevo
            onGuardar={(m) => {
              try {
                crear(m);
                setNuevo(false);
              } catch {
                /* duplicado */
              }
            }}
            onCancelar={() => setNuevo(false)}
          />
        </div>
      )}

      <div className="space-y-2">
        {lista.map((m) =>
          editando === m.id ? (
            <MesaEditor
              key={m.id}
              mesa={m}
              onGuardar={(datos) => {
                actualizar(m.id, datos);
                setEditando(null);
              }}
              onCancelar={() => setEditando(null)}
            />
          ) : (
            <article
              key={m.id}
              className={[
                "flex items-center justify-between gap-3 rounded-xl border-2 p-3",
                m.activa ? "border-border bg-card" : "border-dashed opacity-60",
              ].join(" ")}
            >
              <div>
                <p className="font-bold">
                  {m.nombreVisible}
                  {m.esVarianteB && (
                    <span className="ml-1 text-xs text-muted">(B)</span>
                  )}
                </p>
                <p className="text-xs text-muted">
                  {m.codigo} · orden {m.orden}
                  {m.permiteVarianteB && " · +B"}
                  {!m.activa && " · inactiva"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditando(m.id);
                  setNuevo(false);
                }}
                className="rounded-lg border border-border px-3 py-2 text-sm font-semibold"
              >
                Editar
              </button>
            </article>
          ),
        )}
      </div>

      <div className="mt-8">
        <Button
          variant="ghost"
          fullWidth
          className="text-muted"
          onClick={() => setConfirmReset(true)}
        >
          Restaurar mesas por defecto
        </Button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="¿Restaurar mesas?"
        message="Se volverá a la distribución original de La Taberneta."
        confirmLabel="Restaurar"
        onConfirm={() => {
          restaurarDefault();
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </main>
  );
}
