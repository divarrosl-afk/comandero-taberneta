"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MenuDiaImportPanel } from "@/components/configuracion/MenuDiaImportPanel";
import { useMenuDia } from "@/hooks/useMenuDia";
import { menuTienePlatosImportados } from "@/lib/menu-dia/menu-platos-comanda";
import type { MenuDiaConfig } from "@/types/menu-dia";

export function MenuDiaConfigClient() {
  const { menu, guardar, quitar, cargando } = useMenuDia();
  const [confirmQuitar, setConfirmQuitar] = useState(false);
  const [guardando, setGuardando] = useState(false);

  if (!menu || cargando) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-4">
        <p className="text-muted">Cargando menú…</p>
      </main>
    );
  }

  const patch = async (cambios: Partial<MenuDiaConfig>) => {
    setGuardando(true);
    try {
      await guardar({ ...menu, ...cambios });
    } finally {
      setGuardando(false);
    }
  };

  const aplicarImport = async (cambios: Partial<MenuDiaConfig>) => {
    await patch(cambios);
  };

  const tieneMenu = menuTienePlatosImportados(menu);

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
          Un PDF al día. Permanece en móvil y PC hasta que subas el siguiente.
        </p>
      </header>

      <MenuDiaImportPanel menuActual={menu} onAplicar={aplicarImport} />

      <section className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">
              Fecha
            </label>
            <input
              type="date"
              value={menu.fecha}
              onChange={(e) => void patch({ fecha: e.target.value })}
              disabled={guardando}
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
              onChange={(e) =>
                void patch({ precioMenu: Number(e.target.value) || 0 })
              }
              disabled={guardando}
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
            onChange={(e) => void patch({ observaciones: e.target.value })}
            disabled={guardando}
            rows={2}
            placeholder="Ej: BEBIDA, PAN Y POSTRE"
            className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 outline-none focus:border-primary"
          />
        </div>

        <button
          type="button"
          onClick={() => void patch({ activo: !menu.activo })}
          disabled={guardando || !tieneMenu}
          className={[
            "w-full rounded-xl border-2 py-3 text-sm font-bold",
            menu.activo
              ? "border-green-300 bg-green-50 text-green-800"
              : "border-border bg-background text-muted",
          ].join(" ")}
        >
          {menu.activo ? "✓ Menú activo en comandas" : "Activar menú en comandas"}
        </button>

        {tieneMenu && (
          <Button
            variant="outline"
            fullWidth
            onClick={() => setConfirmQuitar(true)}
            disabled={guardando}
          >
            Quitar menú actual
          </Button>
        )}
      </section>

      <ConfirmDialog
        open={confirmQuitar}
        title="¿Quitar menú del día?"
        message="Los platos desaparecerán de comandas en todos los dispositivos. Sube el PDF del día siguiente cuando quieras activar el menú nuevo."
        confirmLabel="Quitar menú"
        onConfirm={() => {
          setConfirmQuitar(false);
          void quitar();
        }}
        onCancel={() => setConfirmQuitar(false)}
      />
    </main>
  );
}
