"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";

const accionesBase = [
  {
    titulo: "Nueva comanda",
    descripcion: "Crear pedido de cocina y barra",
    href: "/comanda/nueva",
    disponible: true,
    adminOnly: false,
  },
  {
    titulo: "Postres",
    descripcion: "Comandero separado de postres",
    href: "/postres/nuevo",
    disponible: true,
    adminOnly: false,
  },
  {
    titulo: "Panel cocina",
    descripcion: "Ver comandas por secciones",
    href: "/panel",
    disponible: true,
    adminOnly: false,
  },
  {
    titulo: "Historial",
    descripcion: "Comandas del día",
    href: "/historial",
    disponible: true,
    adminOnly: false,
  },
  {
    titulo: "Impresora",
    descripcion: "Configurar impresora principal",
    href: "/configuracion/impresora",
    disponible: true,
    adminOnly: true,
  },
  {
    titulo: "Catálogo",
    descripcion: "Platos, bebidas y postres",
    href: "/configuracion/catalogo",
    disponible: true,
    adminOnly: true,
  },
];

export function HomeClient() {
  const { sesion, puedeConfigCatalogo, puedeConfigImpresora } = useAuth();

  const acciones = accionesBase.filter((accion) => {
    if (!accion.adminOnly) return true;
    if (accion.href === "/configuracion/catalogo") return puedeConfigCatalogo;
    if (accion.href === "/configuracion/impresora") return puedeConfigImpresora;
    return true;
  });

  return (
    <RequireAuth>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-6">
        <header className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            La Taberneta de Ca la Ingrid
          </p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Comandero</h1>
          <p className="mt-2 text-muted">
            {sesion ? `Hola, ${sesion.nombre}` : "Web app para camareros"}
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Acceso rápido</h2>
          <p className="mt-1 text-sm text-muted">Toca una opción para empezar</p>

          <ul className="mt-4 space-y-3">
            {acciones.map((accion) => (
              <li key={accion.titulo}>
                {accion.disponible ? (
                  <Link
                    href={accion.href}
                    className="flex min-h-14 items-center justify-between rounded-xl bg-primary px-4 py-3 text-primary-foreground transition active:scale-[0.98]"
                  >
                    <div>
                      <p className="font-semibold">{accion.titulo}</p>
                      <p className="text-sm opacity-80">{accion.descripcion}</p>
                    </div>
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <div
                    className="flex min-h-14 items-center justify-between rounded-xl border border-border bg-background px-4 py-3 opacity-60"
                    aria-disabled="true"
                  >
                    <div>
                      <p className="font-semibold">{accion.titulo}</p>
                      <p className="text-sm text-muted">{accion.descripcion}</p>
                    </div>
                    <span className="rounded-full bg-border px-2 py-0.5 text-xs font-medium text-muted">
                      Próximamente
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-dashed border-border bg-card/50 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Estado del proyecto
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Base Next.js + TypeScript + PWA
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Usuarios y roles locales
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Supabase preparado (sin conectar)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-stone-300" />
              Integración Ágora TPV — módulo futuro
            </li>
          </ul>
        </section>

        <footer className="mt-auto pt-8 text-center text-xs text-muted">
          <p>comandero-taberneta v0.1.0</p>
          <p className="mt-1">Guarda esta web en la pantalla de inicio del móvil</p>
        </footer>
      </main>
    </RequireAuth>
  );
}
