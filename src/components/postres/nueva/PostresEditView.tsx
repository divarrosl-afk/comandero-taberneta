"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BottomBar } from "@/components/ui/BottomBar";
import { MesaSelector } from "@/components/comanda/MesaSelector";
import { CabeceraComanda } from "@/components/comanda/nueva/CabeceraComanda";
import { ClHButton } from "@/components/postres/nueva/ClHButton";
import { EstadoXSelector } from "@/components/postres/nueva/EstadoXSelector";
import { PostresObservacionesSection } from "@/components/postres/nueva/PostresObservacionesSection";
import { PostresSeccionPanel } from "@/components/postres/nueva/PostresSeccionPanel";
import type { usePostresForm } from "@/hooks/usePostresForm";

type PostresFormActions = ReturnType<typeof usePostresForm>;

type TabPostres = "mesa" | "postres" | "opciones" | "observaciones";

const TABS: { id: TabPostres; label: string }[] = [
  { id: "mesa", label: "Mesa" },
  { id: "postres", label: "Postres" },
  { id: "opciones", label: "X / C/L" },
  { id: "observaciones", label: "Obs." },
];

interface PostresEditViewProps {
  form: PostresFormActions["form"];
  borradorRecuperado: boolean;
  esValido: boolean;
  onSetMesa: PostresFormActions["setMesa"];
  onUpdatePostre: PostresFormActions["updatePostre"];
  onAddPostre: PostresFormActions["addPostre"];
  onAddPostreFrecuente: PostresFormActions["addPostreFrecuente"];
  onRemovePostre: PostresFormActions["removePostre"];
  onDuplicatePostre: PostresFormActions["duplicatePostre"];
  onClearPostres: PostresFormActions["clearPostres"];
  onSetEstadoX: PostresFormActions["setEstadoX"];
  onToggleClH: PostresFormActions["toggleClH"];
  onSetObservacion: PostresFormActions["setObservacion"];
  onAddObservacion: PostresFormActions["addObservacion"];
  onRemoveObservacion: PostresFormActions["removeObservacion"];
  onObservacionRapida: PostresFormActions["appendObservacionRapida"];
  onDescartarBorrador: PostresFormActions["descartarBorrador"];
  onPreview: () => void;
}

function getValidationHint(form: PostresFormActions["form"]): string | undefined {
  if (!form.mesa) return "Selecciona una mesa";
  return "Añade al menos un postre, X o C/L + H";
}

export function PostresEditView({
  form,
  borradorRecuperado,
  esValido,
  onSetMesa,
  onUpdatePostre,
  onAddPostre,
  onAddPostreFrecuente,
  onRemovePostre,
  onDuplicatePostre,
  onClearPostres,
  onSetEstadoX,
  onToggleClH,
  onSetObservacion,
  onAddObservacion,
  onRemoveObservacion,
  onObservacionRapida,
  onDescartarBorrador,
  onPreview,
}: PostresEditViewProps) {
  const [tab, setTab] = useState<TabPostres>("mesa");
  const [busqueda, setBusqueda] = useState("");

  return (
    <>
      <header className="mb-2">
        <Link
          href="/"
          className="mb-2 inline-block text-sm font-semibold text-accent"
        >
          ← Inicio
        </Link>
        <h1 className="text-2xl font-bold text-primary">Comandero postres</h1>
        <p className="mt-1 text-sm text-muted">Ticket separado · sin copia cocina</p>
      </header>

      {borradorRecuperado && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">
            Borrador recuperado automáticamente
          </p>
          <button
            type="button"
            onClick={onDescartarBorrador}
            className="shrink-0 text-sm font-semibold text-amber-700 underline"
          >
            Descartar
          </button>
        </div>
      )}

      <CabeceraComanda mesa={form.mesa} />

      <nav className="sticky top-[4.5rem] z-10 -mx-4 border-b border-border bg-background/95 px-2 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-lg gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setBusqueda("");
              }}
              className={[
                "shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition active:scale-95",
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-foreground hover:bg-border/40",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-4 space-y-4 pb-4">
        {tab === "mesa" && (
          <div className="space-y-6">
            <MesaSelector mesaSeleccionada={form.mesa} onSelect={onSetMesa} />
          </div>
        )}

        {tab === "postres" && (
          <PostresSeccionPanel
            postres={form.postres}
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            onUpdate={onUpdatePostre}
            onAdd={onAddPostre}
            onAddFrecuente={onAddPostreFrecuente}
            onRemove={onRemovePostre}
            onDuplicate={onDuplicatePostre}
            onClear={onClearPostres}
          />
        )}

        {tab === "opciones" && (
          <div className="space-y-4">
            <EstadoXSelector value={form.estadoX} onChange={onSetEstadoX} />
            <ClHButton active={form.clH} onToggle={onToggleClH} />
          </div>
        )}

        {tab === "observaciones" && (
          <PostresObservacionesSection
            observaciones={form.observaciones}
            onChange={onSetObservacion}
            onAdd={onAddObservacion}
            onRemove={onRemoveObservacion}
            onRapida={onObservacionRapida}
          />
        )}
      </div>

      <BottomBar hint={!esValido ? getValidationHint(form) : undefined}>
        <Button fullWidth size="lg" disabled={!esValido} onClick={onPreview}>
          Ver vista previa
        </Button>
      </BottomBar>
    </>
  );
}
