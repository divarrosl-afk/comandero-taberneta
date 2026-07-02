"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { MenuDiaImportPanel } from "@/components/configuracion/MenuDiaImportPanel";
import { useCatalogo } from "@/hooks/useCatalogo";
import { useMenuDia } from "@/hooks/useMenuDia";
import type { MenuDiaConfig } from "@/types/menu-dia";
import { productoParaUsoComanda } from "@/lib/carta/carta-admin";
import { nombreBoton } from "@/types/catalogo";

function SelectorPlatos({
  titulo,
  ids,
  opciones,
  onToggle,
}: {
  titulo: string;
  ids: string[];
  opciones: { id: string; nombre: string }[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold">{titulo}</p>
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
        {opciones.length === 0 ? (
          <p className="p-2 text-sm text-muted">No hay platos en carta</p>
        ) : (
          opciones.map((p) => {
            const sel = ids.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onToggle(p.id)}
                className={[
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium",
                  sel ? "bg-primary text-primary-foreground" : "hover:bg-border/40",
                ].join(" ")}
              >
                {p.nombre}
                <span>{sel ? "✓" : "+"}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function MenuDiaConfigClient() {
  const { menu, actualizar, guardar } = useMenuDia();
  const { productos, actualizar: actualizarProducto } = useCatalogo();

  const primeros = useMemo(
    () =>
      productos
        .filter(
          (p) => p.activo && productoParaUsoComanda(p, "primeros"),
        )
        .map((p) => ({ id: p.id, nombre: nombreBoton(p) })),
    [productos],
  );

  const segundos = useMemo(
    () =>
      productos
        .filter(
          (p) => p.activo && productoParaUsoComanda(p, "segundos"),
        )
        .map((p) => ({ id: p.id, nombre: nombreBoton(p) })),
    [productos],
  );

  const postres = useMemo(
    () =>
      productos
        .filter((p) => p.activo && p.seccion === "postres")
        .map((p) => ({ id: p.id, nombre: nombreBoton(p) })),
    [productos],
  );

  if (!menu) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-4">
        <p className="text-muted">Cargando menú…</p>
      </main>
    );
  }

  const toggleId = (
    campo: "primerosIds" | "segundosIds" | "postresIncluidosIds",
    id: string,
  ) => {
    const lista = menu[campo];
    const siguiente = lista.includes(id)
      ? lista.filter((x) => x !== id)
      : [...lista, id];
    actualizar({ [campo]: siguiente });
  };

  const patch = (cambios: Partial<MenuDiaConfig>) => {
    guardar({ ...menu, ...cambios });
  };

  const aplicarImport = async (
    cambios: Partial<MenuDiaConfig>,
    suplementosProducto: { id: string; suplemento: number }[],
  ) => {
    patch(cambios);
    for (const { id, suplemento } of suplementosProducto) {
      await actualizarProducto(id, {
        suplemento,
        tipo: "menu-dia",
      });
    }
  };

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-4 pb-8">
      <header className="mb-4">
        <Link
          href="/"
          className="mb-2 inline-block text-sm font-semibold text-accent"
        >
          ← Inicio
        </Link>
        <h1 className="text-2xl font-bold text-primary">Menú del día</h1>
        <p className="mt-1 text-sm text-muted">
          Selecciona platos de la carta para el menú de hoy
        </p>
        <Link
          href="/configuracion/carta"
          className="mt-2 inline-block text-sm font-semibold text-accent underline"
        >
          ← Editar carta
        </Link>
      </header>

      <section className="mb-6 space-y-4 rounded-2xl border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">
              Fecha
            </label>
            <input
              type="date"
              value={menu.fecha}
              onChange={(e) => patch({ fecha: e.target.value })}
              className="min-h-11 w-full rounded-xl border-2 border-border bg-background px-3 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">
              Precio menú €
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={menu.precioMenu}
              onChange={(e) => patch({ precioMenu: Number(e.target.value) || 0 })}
              className="min-h-11 w-full rounded-xl border-2 border-border bg-background px-3 outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">
              Suplemento 1º €
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={menu.suplementoPrimeros ?? ""}
              onChange={(e) =>
                patch({
                  suplementoPrimeros: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className="min-h-11 w-full rounded-xl border-2 border-border bg-background px-3 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">
              Suplemento 2º €
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={menu.suplementoSegundos ?? ""}
              onChange={(e) =>
                patch({
                  suplementoSegundos: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className="min-h-11 w-full rounded-xl border-2 border-border bg-background px-3 outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Observaciones del menú
          </label>
          <textarea
            value={menu.observaciones ?? ""}
            onChange={(e) => patch({ observaciones: e.target.value })}
            rows={2}
            placeholder="Ej: Incluye pan y bebida"
            className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 outline-none focus:border-primary"
          />
        </div>

        <button
          type="button"
          onClick={() => patch({ activo: !menu.activo })}
          className={[
            "w-full rounded-xl border-2 py-3 text-sm font-bold",
            menu.activo
              ? "border-green-300 bg-green-50 text-green-800"
              : "border-border bg-background text-muted",
          ].join(" ")}
        >
          {menu.activo ? "✓ Menú activo hoy" : "Menú inactivo — activar"}
        </button>
      </section>

      <div className="mb-6">
        <MenuDiaImportPanel productos={productos} onAplicar={aplicarImport} />
      </div>

      <div className="space-y-4">
        <SelectorPlatos
          titulo={`Primeros (${menu.primerosIds.length})`}
          ids={menu.primerosIds}
          opciones={primeros}
          onToggle={(id) => toggleId("primerosIds", id)}
        />
        <SelectorPlatos
          titulo={`Segundos (${menu.segundosIds.length})`}
          ids={menu.segundosIds}
          opciones={segundos}
          onToggle={(id) => toggleId("segundosIds", id)}
        />
        <SelectorPlatos
          titulo={`Postres incluidos (${menu.postresIncluidosIds.length})`}
          ids={menu.postresIncluidosIds}
          opciones={postres}
          onToggle={(id) => toggleId("postresIncluidosIds", id)}
        />
      </div>

      <div className="mt-6">
        <Button
          fullWidth
          onClick={() => patch({ activo: true })}
          disabled={menu.primerosIds.length === 0 && menu.segundosIds.length === 0}
        >
          Guardar y activar menú
        </Button>
      </div>
    </main>
  );
}
