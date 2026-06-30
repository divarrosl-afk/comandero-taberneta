"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { CamareroSelector } from "@/components/comanda/CamareroSelector";
import { ComandaPreview } from "@/components/comanda/ComandaPreview";
import { MesaSelector } from "@/components/comanda/MesaSelector";
import { ObservacionesSection } from "@/components/comanda/ObservacionesSection";
import { SeccionPlatos } from "@/components/comanda/SeccionPlatos";
import { useComandaForm } from "@/hooks/useComandaForm";
import { formToComanda } from "@/lib/comanda/format";
import { guardarComandaLocal } from "@/lib/storage/comandas-local";

export function ComandaNuevaClient() {
  const {
    form,
    step,
    setStep,
    setMesa,
    setCamarero,
    updatePlato,
    addPlato,
    removePlato,
    setObservacion,
    addObservacion,
    removeObservacion,
    reset,
    puedePrevisualizar,
  } = useComandaForm();

  const comandaPreview = useMemo(() => formToComanda(form), [form]);

  const handleEnviar = () => {
    if (!comandaPreview) return;
    guardarComandaLocal(comandaPreview);
    setStep("enviada");
  };

  if (step === "enviada" && comandaPreview) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-6">
        <header className="mb-6 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-green-600">
            Comanda enviada
          </p>
          <h1 className="mt-2 text-2xl font-bold text-primary">
            MESA {comandaPreview.mesa}
          </h1>
          <p className="mt-1 text-muted">
            Guardada en este dispositivo (modo local)
          </p>
        </header>

        <ComandaPreview comanda={comandaPreview} />

        <div className="mt-6 space-y-3">
          <Button fullWidth onClick={reset}>
            Nueva comanda
          </Button>
          <Link href="/" className="block">
            <Button variant="outline" fullWidth>
              Volver al inicio
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  if (step === "preview" && comandaPreview) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-6 pb-28">
        <header className="mb-4">
          <button
            type="button"
            onClick={() => setStep("editar")}
            className="mb-2 text-sm font-medium text-accent"
          >
            ← Volver a editar
          </button>
          <h1 className="text-2xl font-bold text-primary">Revisar comanda</h1>
          <p className="mt-1 text-sm text-muted">
            MESA {comandaPreview.mesa} · {comandaPreview.camarero}
          </p>
        </header>

        <ComandaPreview comanda={comandaPreview} />

        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-lg gap-3">
            <Button variant="outline" fullWidth onClick={() => setStep("editar")}>
              Editar
            </Button>
            <Button fullWidth onClick={handleEnviar}>
              Enviar comanda
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-6 pb-28">
      <header className="mb-6">
        <Link href="/" className="mb-2 inline-block text-sm font-medium text-accent">
          ← Inicio
        </Link>
        <h1 className="text-2xl font-bold text-primary">Nueva comanda</h1>
        <p className="mt-1 text-sm text-muted">Cocina y barra</p>
      </header>

      <div className="space-y-6">
        <MesaSelector mesaSeleccionada={form.mesa} onSelect={setMesa} />
        <CamareroSelector
          camareroSeleccionado={form.camareroId}
          onSelect={setCamarero}
        />
        <SeccionPlatos
          titulo="Entrantes"
          platos={form.entrantes}
          onUpdate={(id, cambios) => updatePlato("entrantes", id, cambios)}
          onAdd={() => addPlato("entrantes")}
          onRemove={(id) => removePlato("entrantes", id)}
        />
        <SeccionPlatos
          titulo="Primeros"
          platos={form.primeros}
          conTipo
          onUpdate={(id, cambios) => updatePlato("primeros", id, cambios)}
          onAdd={() => addPlato("primeros")}
          onRemove={(id) => removePlato("primeros", id)}
        />
        <SeccionPlatos
          titulo="Segundos"
          platos={form.segundos}
          conTipo
          onUpdate={(id, cambios) => updatePlato("segundos", id, cambios)}
          onAdd={() => addPlato("segundos")}
          onRemove={(id) => removePlato("segundos", id)}
        />
        <SeccionPlatos
          titulo="Bebidas"
          platos={form.bebidas}
          onUpdate={(id, cambios) => updatePlato("bebidas", id, cambios)}
          onAdd={() => addPlato("bebidas")}
          onRemove={(id) => removePlato("bebidas", id)}
        />
        <ObservacionesSection
          observaciones={form.observaciones}
          onChange={setObservacion}
          onAdd={addObservacion}
          onRemove={removeObservacion}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-lg">
          {!form.mesa && (
            <p className="mb-2 text-center text-sm text-amber-700">
              Selecciona una mesa
            </p>
          )}
          {form.mesa && !form.camareroId && (
            <p className="mb-2 text-center text-sm text-amber-700">
              Selecciona un camarero
            </p>
          )}
          <Button
            fullWidth
            disabled={!puedePrevisualizar}
            onClick={() => setStep("preview")}
          >
            Ver vista previa
          </Button>
        </div>
      </div>
    </main>
  );
}
